const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

// remember to check for success of these methods in user controller

module.exports = new Class Registrar {
    
    // register for a race -- can only add users to an open race
    async function register (user, race) {
        try {
            if (!race.isOpen) { throw Err.notOpen }
            
            user.register(race)
            race.addRunner(user)
        
            await user.save()
            await race.save()
            
            return Say.success(Say.registered)
        } catch (error) { Err.make(error) }
    }
    
    // un-register from a race -- will not allow if user has any teams or results for this race
    async function unregister (user, race) {
        try {
            if (user.races.includes(race.id)) {
                let results = Result.find( {runnerId: user.id })
                if (results.length > 0) { throw Err.editsClosed }
                
                await user.teams.forEach(async (teamId) => {
                    let team = await Team.findById(teamId)
                    if (team.raceId = race.id) { throw Err.stillOnTeam }
                })
                
                // if no teams or results for this race
                user.unregister(race)
                race.removeRunner(user)
            
                await user.save()
                await race.save()
            }
            
            return Say.success(Say.removed)
        } catch (error) { Err.make(error) }
    }
    
    // check if a user is current
    async function userIsCurrent (user) {
        try {
            let race = await Race.findById(user.currentRaceId)
            if (race) { return race.isOpen }
            return false
        } catch (error) { Err.make(error) }
    }
    
    // inactivates a user, done instead of deleting users, retaining past race data but removing login/authorization and user data
    async function inactivateUser(user) {
        try {
            let currentTeam = await Team.findById(user.currentTeamId)
            if (currentTeam) {
                if (user.owns(currentTeam)) { throw Err.transferOwnership }
                team.removeMember(user)
                await team.save()
            }
            
            user.inactivate()
            await user.save()
            return Say.success(Say.inactivated)
            
        } catch (error) { Err.make(error) }
    }
}
