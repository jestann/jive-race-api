const mongoose = require('mongoose')
const ObjectId = mongoose.mongo.ObjectId

const Registrar = require('./registrar')
const registrar = new Registrar()

const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model

// no saving in this class, to avoid persisting data prior to errors being thrown

class Memberizer {
    // leave team as a member -- won't allow owner to leave a team unless transfer ownership
    leaveTeam (user, team) {
        try {
            if (!user.isOnTeam(team)) { throw Err.notOnTeam }
            if (user.owns(team)) { throw Err.transferOwnership } // must transfer ownership first
            
            user.leaveTeam(team)
            team.removeMember(user)
            return Say.success(Say.leftTeam)
        } catch (error) { return Err.make(error) }
    }

    // join team -- won't allow a team owner to join a new team unless transfer ownership of old team
    async joinTeam (user, team) {
        try {
            // redundant ?
            if (!user.isCurrent) { throw Err.notCurrent }
            
            // check race is open
            let race = await Race.findById(team.raceId)
            if (!race) { throw Err.raceNotFound }
            if (!race.isOpen) { throw Err.notOpen }
            
            if (!user.isRunningRace(race)) { throw Err.notRegistered } // must be registered for race
            if (!user.isCurrentRace(race)) { throw Err.notCurrent } // it must be the user's current race
            if (user.currentTeamId && !user.isCurrentTeam(team)) { throw Err.alreadyOnTeam } // must leave current team first

            user.joinTeam(team, race)
            team.addMember(user)

            return Say.success(Say.joined)
            
        } catch (error) { return Err.make(error) }
    }

    // transfer ownership -- leaves old owner as team member, new owner must also be team member
    transfer (newOwner, team) {
        try {
            if (!newOwner.isOnTeam(team)) { throw Err.cantOwn }
            if (!newOwner.isCurrentTeam(team)) { throw Err.notCurrent } // indirectly prevents owning another team
            
            team.transfer(newOwner)
            return Say.success(Say.transferred)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = Memberizer

// what about when someone removes the last member from a team?
// couldn't happen, have to transfer ownership to remove the owner from a team, to a person. or the owner could delete the team.
// what happens when a team gets deleted with members on it? they just become teamless i guess.