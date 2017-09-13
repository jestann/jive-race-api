const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

module.exports = new Class TeamController {
    async function index (req) {
        try {
            // authorize
            if (!authorizer.team.index(req.user)) { throw Err.notAuthorized }
            
            // query and return
            let teams = await Team.find({})
            return { Say.success('teams', teams) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            // authorize
            if (!authorizer.team.create(req.user)) { throw Err.notAuthorized }
        
            // check required attributes -- add validation here
            if (!req.body.race || !req.body.name || !req.body.owner) { throw Err.missingData } // if missing any required data
            let name = req.body.name
            
            let race = await Race.findById(req.body.race.id)
            if (!race) { throw Err.raceNotFound }
            
            let owner = await User.findById(req.body.owner.id)
            if (!owner) { throw Err.userNotFound }
            
            // create new team
            let newTeam = new Team({
                name: name,
                race: race,
                owner: owner
            })
            
            // update race and owner
            race.addTeam(team)
            owner.joinTeam(team)
            
            // add additional attributes
            if (req.body.description) { newTeam.description = req.body.description }
            if (req.body.meetingLocation) { newTeam.meetingLocation = req.body.meetingLocation }
            if (req.body.slackChannel) { newTeam.slackChannel = req.body.slackChannel }

            // save and return
            let savedTeam = await newTeam.save() 
            return { Say.success('team', savedTeam, Say.created) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.show(req.user, team)) { throw Err.notAuthorized }
            
            // return instance
            return { Say.success('team', team) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function update (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.update(req.user, team)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here
            for attribute in req.body.teamData {
                if (authorizor.team.validAttributes.includes(attribute) && attribute !== 'owner' && attribute !== 'race') {
                    team[attribute] = req.body.teamData[attribute]
                }
            }
            
            // handle race and owner separately
            if (req.body.teamData.race) {
                let race = await Race.findById(req.body.teamData.race.id) 
                if (!race) { throw Err.raceNotFound }
                team.race = race
            }
            
            if (req.body.teamData.owner) {
                let owner = await User.findById(req.body.teamData.owner.id)
                if (!owner) { throw Err.userNotFound }
                team.owner = owner
            }

            // save updates
            let savedTeam = await team.save()
            return { Say.success('team', savedTeam, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.destroy(req.user, team)) { throw Err.notAuthorized }

            // delete and return success
            await team.remove()
            return { Say.success(Say.destroyed) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function members (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.members(req.user, team)) { throw Err.notAuthorized }
            
            // query and return
            let members = team.members
            return { Say.success('members', members) }

        } catch (error) { return Err.make(error) }
    }
    
    async function results (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.results(req.user, team)) { throw Err.notAuthorized }
            
            // query and return success
            let results = team.results
            return { Say.success('results', results) }

        } catch (error) { return Err.make(error) }
    }
    
    async function transfer (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.transfer(req.user, team)) { throw Err.notAuthorized }

            // change ownership
            if (!req.body.owner) { throw Err.missingData }
            let newOwner = await User.findById(req.body.owner.id) 
            if (!newOwner) { throw Err.userNotFound }
            team.transfer(newOwner)

            // save updates
            let savedTeam = await team.save()
            return { Say.success('team', savedTeam, Say.updated) }

        } catch (error) { return Err.make(error) }
    }
}
