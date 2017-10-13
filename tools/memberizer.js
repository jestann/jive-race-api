const mongoose = require('mongoose')
const ObjectId = mongoose.mongo.ObjectId

const Registrar = require('./registrar')
const registrar = new Registrar()

const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model

// no saving in this class, to avoid saving data prior to errors being thrown

class Memberizer {
    // leave team as a member -- won't allow owner to leave a team unless transfer ownership
    async memberLeaveTeam (user, team) {
        try {
            if (user.isOnTeam(team) && !user.owns(team)) {
                user.memberLeaveTeam(team)
                team.removeMember(user)
            }
            
            return Say.success(Say.removed)
            
        } catch (error) { return Err.make(error) }
    }

    // join team -- won't allow a team owner to join a new team unless transfer ownership of old team
    async memberJoinTeam (user, team) {
        try {
            // check user is current
            let userIsCurrent = await registrar.userIsCurrent(user)
            if (!userIsCurrent) { throw Err.notCurrent }
            
            // check race is open
            let race = await Race.findById(team.raceId)
            if (!race) { throw Err.raceNotFound }
            if (!race.isOpen) { throw Err.notOpen }
            
            // check user is registered for race
            if (!user.races.include(race._id)) { throw Err.notCurrent }

            // forces user to leave current team first
            // if (user.currentTeamId) {
            //    let currentTeam = await Team.findById(user.currentTeamId)
            //    if (!currentTeam) { throw Err.teamNotFound }
            //    let left = await this.memberLeaveTeam(user, currentTeam)
            //    if (!left.success) { throw left }
            //}
            
            user.memberJoinTeam(team, race)
            team.addMember(user)

            return Say.success(Say.joined)
            
        } catch (error) { return Err.make(error) }
    }
    
    // transfer ownership -- leaves old owner as team member, new owner must also be team member
    async transfer (newOwner, team) {
        try {
            if (!newOwner.isOnTeam(team)) { throw Err.notOnTeam }
            team.transferOwnership(newOwner)
            return Say.success(Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = Memberizer

// what about when someone removes the last member from a team?
// couldn't happen, have to transfer ownership to remove the owner from a team, to a person. or the owner could delete the team.
// what happens when a team gets deleted with members on it? they just become teamless i guess.