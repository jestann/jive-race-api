const bcrypt = require('bcrypt')
const validator = require('validator')
const authorizer = require('./../tools/authorizer')
const registrar = require('./../tools/registrar')
const memberizer = require('./../tools/memberizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

module.exports = new Class UserController {
    async function index (req) {
        try {
            if (!authorizer.user.index(req.user)) { throw Err.notAuthorized }
            let users = await User.find({})
            return Say.success('users', users)
    
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            if (!authorizer.user.create(req.user)) { throw Err.notAuthorized }
        
            // add required attributes -- add validation here 
            if (!req.body.email || !req.body.username || !req.body.password) { throw Err.missingData } // if missing any required data
            let email = req.body.email
            let username = req.body.username
            let passwordHash = await bcrypt.hash(req.body.password, 10)

            // create and save
            let newUser = new User({
                email: email,
                username: username,
                password: passwordHash,
                role: 'member'
            })

            await newUser.save() 
            return Say.success('user', newUser, Say.created)
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.show(req.user, userInstance)) { throw Err.notAuthorized }
            
            // return instance
            return Say.success('user', userInstance)
            
        } catch (error) { return Err.make(error) }
    }
    
    async function update (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.updateSelf(req.user, userInstance)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here -- also add check for required attributes
            for attribute in req.body {
                if (authorizor.user.validSelfAttributes.includes(attribute) && attribute !== 'password') { 
                    userInstance[attribute] = req.body[attribute]
                }
            }
            // handle password separately
            if (req.body.password) { userInstance.password = await bcrypt.hash(req.body.password, 10) }

            // administrative updates if allowed
            if (authorize.user.updateAdmin(req.user, userInstance)) {
                for attribute in req.body {
                    if (authorizor.user.validAdminAttributes.includes(attribute)) { userInstance[attribute] = req.body[attribute] }
                }
            }

            await userInstance.save()
            return Say.success('user', userInstance, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.destroy(req.user, userInstance)) { throw Err.notAuthorized }

            // inactivate and return success
            let inactivated = await registrar.inactivateUser(userInstance)
            if (!inactivated.success) { throw inactivated }
            return Say.success(Say.destroyed)

        } catch (error) { return Err.make(error) }
    }
    
    async function races (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.races(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return
            let races = []
            await userInstance.races.forEach(async (raceId) => {
                let race = await Race.findById(raceId) { if (race) { races.push(race) } }
            })
            return Say.success('races', races)

        } catch (error) { return Err.make(error) }
    }
    
    async function teams (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.teams(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return
            let teams = []
            await userInstance.teams.forEach(async (teamId) => {
                let team = await Team.findById(teamId) { if (team) { teams.push(team) } }
            })
            return Say.success('teams', teams)

        } catch (error) { return Err.make(error) }
    }
    
    async function results (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.results(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return success
            let results = []
            await userInstance.results.forEach(async (resultId) => {
                let result = await Result.findById(resultId) { if (result) { results.push(result) } }
            })
            return Say.success('results', results)

        } catch (error) { return Err.make(error) }
    }
    
    async function register (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            let authorized = await authorizer.user.register(req.user, userInstance)
            if (!authorized) { throw Err.notAuthorized }

            // payment will be taken care of prior to this step
            // it will be handled through a separate payment controller before this route is called
            
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            
            // this will check if the race is open for registration and register the user
            let registered = await registrar.register(userInstance, race)
            if (!registered.success) { throw registered }
            
            return Say.success('user', userInstance, Say.registered)

        } catch (error) { return Err.make(error) }
    }
    
    async function unregister (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.unregister(req.user, userInstance)) { throw Err.notAuthorized }

            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            let unregistered = await registrar.unregister(userInstance, race)
            if (!unregistered.success) { throw unregistered }
            
            return Say.success('user', userInstance, Say.unregistered)

        } catch (error) { return Err.make(error) }
    }

    async function joinTeam (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            let authorized = await authorizor.user.joinTeam(req.user, userInstance)
            if (!authorized) { throw Err.notAuthorized }

            let team = await Team.findById(req.body.teamId)
            if (!team) { throw Err.teamNotFound }
            
            // check if userInstance already owns a team
            let currentTeam = Team.findById(userInstance.currentTeamId)
            if (userInstance.owns(currentTeam)) { throw Err.transferOwnership }
            
            // if not, join team
            let joined = await memberizer.memberJoinTeam(userInstance, team)
            if (!joined.success) { throw joined }

            return Say.success('user', userInstance, Say.joined)

        } catch (error) { return Err.make(error) }
    }
    
    async function leaveTeam (req) {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            let authorized = await authorizor.user.leaveTeam(req.user, userInstance)
            if (!authorized) { throw Err.notAuthorized }

            let team = await Team.findById(req.body.teamId)
            if (!team) { throw Err.teamNotFound }
            
            // check if userInstance owns the team
            if (userInstance.owns(team)) { throw Err.transferOwnership }
            
            // if not, leave team
            let left = await memberizer.memberLeaveTeam(userInstance, team)
            if (!left.success) { throw left }

            return Say.success('user', userInstance, Say.leftTeam)

        } catch (error) { return Err.make(error) }
    }
    
    async function makeAdmin (req) {
        try {
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.makeAdmin(req.user, userInstance)) { throw Err.notAuthorized }
            
            userInstance.makeAdmin()
            await userInstance.save()
            return Say.success('user', userInstance, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }

    async function makeMember (req) {
        try {
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.makeMember(req.user, userInstance)) { throw Err.notAuthorized }
            
            userInstance.makeMember()
            await userInstance.save()
            return Say.success('user', userInstance, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
}
