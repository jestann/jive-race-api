const registrar = require('./registrar')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model

module.exports = new Class Memberizer {
    // leave team as a member -- won't allow owner to leave a team unless transfer ownership
    async function memberLeaveTeam (user, team) {
        try {
            if (user.isOnTeam(team) && !user.owns(team)) {
                user.memberLeaveTeam(team)
                team.removeMember(user)
                await user.save()
                await team.save()
            }
            
            return Say.success(Say.removed)
            
        } catch (error) { Err.make(error) }
    }

    // join team -- won't allow a team owner to join a new team unless transfer ownership of old team
    async function memberJoinTeam (user, team) {
        try {
            let userIsCurrent = await registrar.userIsCurrent(user)
            
            // forces user to leave current team first
            if (user.currentTeamId) {
                let currentTeam = await Team.findById(user.currentTeamId)
                if (currentTeam) {
                    let left = await memberLeaveTeam(user, user.currentTeam)
                    if (!left.success) { throw left }
                }
            }
            
            user.memberJoinTeam(team)
            team.addMember(user)
            await user.save()
            await team.save()
            
            return Say.success(Say.joined)
            
        } catch (error) { Err.make(error) }
    }
    
    // transfer ownership -- leaves old owner as team member, new owner must also be team member
    async function transfer (newOwner, team) {
        try {
            if (!newOwner.isOnTeam(team)) { throw Err.notOnTeam }
            
            team.transferOwnership(newOwner)
            await team.save()
            return Say.success(Say.updated)
            
        } catch (error) { Err.make(error) }
    }
}

// what about when someone removes the last member from a team?
// couldn't happen, have to transfer ownership to remove the owner from a team, to a person. or the owner could delete the team.
// what happens when a team gets deleted with members on it? they just become teamless i guess.