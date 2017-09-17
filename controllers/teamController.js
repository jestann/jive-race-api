const authorizer = require('./../tools/authorizer')
const memberizer = require('./../tools/memberizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

module.exports = new Class TeamController {
    async function index (req) {
        try {
            if (!authorizer.team.index(req.user)) { throw Err.notAuthorized }
            let teams = await Team.find({})
            return { Say.success('teams', teams) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            let authorized = await authorizor.team.create(req.user)
            if (!authorized) { throw Err.notAuthorized }
        
            // check required attributes -- add validation here
            if (!req.body.raceId || !req.body.name || !req.body.ownerId) { throw Err.missingData } // if missing any required data
            let newTeam = new Team({
                name: req.body.name
            })

            // add additional attributes
            if (req.body.description) { newTeam.description = req.body.description }
            if (req.body.meetingLocation) { newTeam.meetingLocation = req.body.meetingLocation }
            if (req.body.slackChannel) { newTeam.slackChannel = req.body.slackChannel }
            
            // add team to race
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            newTeam.raceId = race.id
            race.addTeam(team)
            await race.save()

            // find owner
            let owner = await User.findById(req.body.ownerId)
            if (!owner) { throw Err.userNotFound }
            
            // check to see if owner already has another team they own
            let ownersCurrentTeam = await Team.findById(owner.currentTeamId)
            if (owner.owns(ownersCurrentTeam) { throw Err.transferOwnership }
            
            // if not, owner joins team
            newTeam.ownerId = owner.id
            let joined = memberizer.memberJoinTeam(owner, team)
            if (!joined) { throw joined }

            await newTeam.save() 
            return { Say.success('team', newTeam, Say.created) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.show(req.user, team)) { throw Err.notAuthorized }
            
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
            for attribute in req.body {
                if (authorizor.team.validAttributes.includes(attribute) && attribute !== 'ownerId') {
                    team[attribute] = req.body[attribute]
                }
            }
            
            // cannot change a team's raceId at this time
            // too many implications for team members and the old and new races
            
            // handle owner separately
            if (req.body.ownerId) {
                let owner = await User.findById(req.body.ownerId)
                if (!owner) { throw Err.userNotFound }
                
                // check to see if new owner already owns a team
                let ownersCurrentTeam = await Team.findById(owner.currentTeamId)
                if (owner.owns(ownersCurrentTeam) { throw Err.transferOwnership }
            
                // if not, owner joins team
                team.ownerId = owner.id
                let joined = memberizer.memberJoinTeam(owner, team)
                if (!joined) { throw joined }
            }
            
            await team.save()
            return { Say.success('team', team, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.destroy(req.user, team)) { throw Err.notAuthorized }
            
            // only allowed if team has no results
            if (team.results.length > 0) { throw Err.editsClosed }

            // remove all members from team
            await team.members.forEach(async (memberId) => {
                let member = await User.findById(memberId)
                if (member) {
                    let left = await memberizer.memberLeaveTeam(member, team)
                    if (!left.success) { throw left }
                }
            })

            // remove team from race
            let race = await Race.findById(team.raceId)
            if (!race) { throw Err.raceNotFound }
            race.removeTeam(team)
            await race.save()

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
            let members = []
            await team.members.forEach(async (memberId) => {
                let member = await User.findById(memberId) { if (member) { members.push(member) } }
            })
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
            let results = []
            await team.results.forEach(async (resultId) => {
                let result = await Result.findById(resultId) { if (result) { results.push(result) } }
            })
            return Say.success('results', results)

        } catch (error) { return Err.make(error) }
    }
    
    async function transfer (req) {
        try {
            // authorize
            let team = await Team.findById(req.params['id'])
            if (!team) { throw Err.teamNotFound }
            if (!authorizer.team.transfer(req.user, team)) { throw Err.notAuthorized }

            // change ownership
            if (!req.body.ownerId) { throw Err.missingData }
            let newOwner = await User.findById(req.body.ownerId) 
            if (!newOwner) { throw Err.userNotFound }
            
            let transferred = await memberizer.transferOwnership(newOwner, team)
            if (!transferred.success) { throw transferred }

            return { Say.success('team', team, Say.updated) }

        } catch (error) { return Err.make(error) }
    }
}
