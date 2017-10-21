const Err = require('./../config/error')
const Say = require('./../config/message')

const authorizer = require('./../tools/authorizer')
const Memberizer = require('./../tools/memberizer')
const memberizer = new Memberizer()

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

class TeamController {
    async index (req) {
        try {
            // authorize and query
            if (!authorizer.team.index(req.user)) { throw Err.notAuthorized }
            let teams = await Team.find({})
            if (!teams) { throw Err.teamNotFound }
            
            return Say.success('teams', teams)
            
        } catch (error) { return Err.make(error) }
    }

    async create (req) {
        try {
            // authorize
            if (!authorizer.team.create(req.user)) { throw Err.notAuthorized }
        
            // check required attributes -- add validation here, their checks for required data aren't as clean as mine
            if (!req.body.name || !req.body.raceId || !req.body.ownerId) { throw Err.missingData }
            let newTeam = new Team({
                name: req.body.name
            })
            if (req.body.description) { newTeam.description = req.body.description }
            if (req.body.meetingLocation) { newTeam.meetingLocation = req.body.meetingLocation }
            if (req.body.slackChannel) { newTeam.slackChannel = req.body.slackChannel }
            
            // add to race
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            newTeam.raceId = race._id
            race.addTeam(newTeam)

            // check if can join owner
            let owner = await User.findById(req.body.ownerId)
            if (!owner) { throw Err.userNotFound }
            let joined = await memberizer.joinTeam(owner, newTeam)
            if (!joined.success) { throw Err.make(joined) }
            newTeam.ownerId = owner._id

            // save all data
            await race.save()
            await owner.save()
            await newTeam.save() 
            return Say.success('team', newTeam, Say.created)
            
        } catch (error) { return Err.make(error) }
    }
    
    async show (req) {
        try {
            // authorize and query
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.show(req.user, team)) { throw Err.notAuthorized }
            
            return Say.success('team', team)
            
        } catch (error) { return Err.make(error) }
    }
    
    async update (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.update(req.user, team)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here
            for (let attribute in req.body) {
                if (authorizer.team.validAttributes.includes(attribute)) {
                    team[attribute] = req.body[attribute]
                }
            }
            // cannot change a team's raceId at this time, too many implications for team members and the old and new races
            // to change a team's owner use transfer ownership
            
            await team.save()
            return Say.success('team', team, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
    
    async destroy (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.destroy(req.user, team)) { throw Err.notAuthorized }
            
            // only allowed if team has no results and no members (except owner)
            if (team.results.length > 0 || team.members.length > 1) { throw Err.editsClosed }

            // remove team from race
            let race = await Race.findById(team.raceId)
            if (!race) { throw Err.raceNotFound }
            race.removeTeam(team)
            
            await race.save()
            await team.remove()
            return Say.success(Say.destroyed)
            
        } catch (error) { return Err.make(error) }
    }
    
    async members (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.members(req.user, team)) { throw Err.notAuthorized }
            
            // query and return
            let members = []
            for (let i=0; i < team.members.length; i++) {
                let member = await User.findById(team.members[i])
                if (member) { members.push(member) }
                else { members.push(Err.userNotFound) }
            }
            return Say.success('members', members)

        } catch (error) { return Err.make(error) }
    }
    
    async results (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.results(req.user, team)) { throw Err.notAuthorized }
            
            // query and return success
            let results = []
            for (let i=0; i < team.results.length; i++) {
                let result = await Result.findById(team.results[i])
                if (result) { results.push(result) }
                else { results.push(Err.itemNotFound) }
            }
            return Say.success('results', results)

        } catch (error) { return Err.make(error) }
    }
    
    async transfer (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.transfer(req.user, team)) { throw Err.notAuthorized }

            // find owner
            if (!req.body.ownerId) { throw Err.missingData }
            let newOwner = await User.findById(req.body.ownerId) 
            if (!newOwner) { throw Err.userNotFound }
            
            // transfer ownership
            let transferred = memberizer.transfer(newOwner, team) // not async
            if (!transferred.success) { throw transferred }
            
            await team.save()
            await newOwner.save()
            return Say.success('[owner, team]', [newOwner, team], Say.transferred)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = TeamController