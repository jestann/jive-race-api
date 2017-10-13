const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

// no saving in this class to prevent persisting data before errors are thrown
// EXCEPTION! inactivate user saves team and user data

class Registrar {
    
    // register for a race -- can only add users to an open race
    async register (user, race) {
        try {
            if (!race.isOpen) { throw Err.notOpen }
            
            user.register(race)
            race.addRunner(user)

            return Say.success(Say.registered)
        } catch (error) { return Err.make(error) }
    }
    
    // un-register from a race -- will not allow if user has any teams or results for this race
    async unregister (user, race) {
        try {
            
            if (user.isRunningRace(race)) {
                let results = Result.find( {runnerId: user.id })
                if (results.length > 0) { throw Err.editsClosed }
                
                for (let i=0; i<user.teams.length; i++) {
                    let team = await Team.findById(this.teams[i])
                    if (team.raceId.toString() === race._id.toString()) { throw Err.stillOnTeam }
                }

                // if no teams or results for this race
                user.unregister(race)
                race.removeRunner(user)
            }
            
            return Say.success(Say.removed)
        } catch (error) { return Err.make(error) }
    }
    
    // check if a user is current
    async userIsCurrent (user) {
        try {
            let race = await Race.findById(user.currentRaceId)
            if (race) { return race.isOpen }
            return false
        } catch (error) { return Err.make(error) }
    }

    // NOTE this has mid-level saving which can cause mismatched data, should any errors be thrown post-save
    
    // inactivates a user, done instead of deleting users, retaining past race data but removing login/authorization and user data
    async inactivateUser (user) {
        try {
            let currentTeam = await Team.findById(user.currentTeamId)
            if (currentTeam) {
                if (user.owns(currentTeam)) { throw Err.transferOwnership }
                currentTeam.removeMember(user)
            }
            
            user.inactivate()
            return Say.success('currentTeam', currentTeam) // hand this back to save in the controller
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = Registrar
