const Err = require('./../config/error')
const Say = require('./../config/message')

const bcrypt = require('bcrypt')
const validator = require('validator')
const authorizer = require('./../tools/authorizer')
const Registrar = require('./../tools/registrar')
const registrar = new Registrar()
const Memberizer = require('./../tools/memberizer')
const memberizer = new Memberizer()

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

class UserController {
    async index (req) {
        try {
            if (!authorizer.user.index(req.user)) { throw Err.notAuthorized }
            let users = await User.find({})
            if (!users) { throw Err.userNotFound }
            return Say.success(req.user, 'users', users)
    
        } catch (error) { return Err.make(error) }
    }

    async create (req) {
        try {
            if (!authorizer.user.create(req.user)) { throw Err.notAuthorized }
        
            // add required attributes -- add validation here, their checks for required data aren't as clean as mine
            if (!req.body.email || !req.body.username || !req.body.password) { throw Err.missingData }
            let passwordHash = await bcrypt.hash(req.body.password, 10)

            // create and save
            let newUser = new User({
                email: req.body.email,
                username: req.body.username,
                password: passwordHash,
                role: 'member'
            })

            await newUser.save() 
            return Say.success(req.user, 'user', newUser, Say.created)
            
        } catch (error) { return Err.make(error) }
    }

    async show (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.show(req.user, userInstance)) { throw Err.notAuthorized }
            
            // return instance
            return Say.success(req.user, 'user', userInstance)
            
        } catch (error) { return Err.make(error) }
    }
    
    async update (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.updateSelf(req.user, userInstance)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here -- also add check for required attributes
            for (let attribute in req.body) {
                if (authorizer.user.validSelfAttributes.includes(attribute) && attribute !== 'password') { 
                    userInstance[attribute] = req.body[attribute]
                }
            }
            // handle password separately
            if (req.body.password) { userInstance.password = await bcrypt.hash(req.body.password, 10) }

            // administrative updates if allowed
            if (authorizer.user.updateAdmin(req.user, userInstance)) {
                for (let attribute in req.body) {
                    if (authorizer.user.validAdminAttributes.includes(attribute)) { userInstance[attribute] = req.body[attribute] }
                }
            }

            await userInstance.save()
            return Say.success(req.user, 'user', userInstance, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
    
    async destroy (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.destroy(req.user, userInstance)) { throw Err.notAuthorized }

            // inactivate and return success
            let inactivated = await registrar.inactivate(userInstance)
            if (!inactivated.success) { throw Err.make(inactivated) }

            if (inactivated.currentTeam) { await inactivated.currentTeam.save() }
            await userInstance.save()
            return Say.success(req.user, Say.destroyed)

        } catch (error) { return Err.make(error) }
    }
    
    async races (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.races(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return
            let races = []
            for (let i=0; i<userInstance.races.length; i++) {
                let race = await Race.findById(userInstance.races[i])
                if (race) { races.push(race) }
                else { races.push(Err.raceNotFound) }
            }
            return Say.success(req.user, 'races', races)

        } catch (error) { return Err.make(error) }
    }
    
    async teams (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.teams(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return
            let teams = []
            for (let i=0; i<userInstance.teams.length; i++) {
                let team = await Team.findById(userInstance.teams[i])
                if (team) { teams.push(team) }
                else { teams.push(Err.teamNotFound) }
            }
            return Say.success(req.user, 'teams', teams)

        } catch (error) { return Err.make(error) }
    }
    
    async results (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.results(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return success
            let results = []
            for (let i=0; i<userInstance.results.length; i++) {
                let result = await Result.findById(userInstance.results[i])
                if (result) { results.push(result) }
                else { results.push(Err.itemNotFound) }
            }
            return Say.success(req.user, 'results', results)

        } catch (error) { return Err.make(error) }
    }
    
    async register (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.register(req.user, userInstance)) { throw Err.notAuthorized }

            // payment will be taken care of prior to this step
            // it will be handled through a separate payment controller before this route is called
            
            if (!req.body.raceId) { throw Err.missingData }
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            
            // this will check if the race is open for registration and register the user
            let registered = await registrar.register(userInstance, race)
            if (!registered.success) { throw Err.make(registered) }
            
            await race.save()
            await userInstance.save()
            return Say.success(req.user, '[user, race]', [userInstance, race], Say.registered)

        } catch (error) { return Err.make(error) }
    }
    
    async unregister (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.unregister(req.user, userInstance)) { throw Err.notAuthorized }

            if (!req.body.raceId) { throw Err.missingData }
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            
            let unregistered = await registrar.unregister(userInstance, race)
            if (!unregistered.success) { throw Err.make(unregistered) }
            
            await race.save()
            await userInstance.save()
            return Say.success(req.user, '[user, race]', [userInstance, race], Say.unregistered)

        } catch (error) { return Err.make(error) }
    }

    async joinTeam (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.joinTeam(req.user, userInstance)) { throw Err.notAuthorized }

            if (!req.body.teamId) { throw Err.missingData }
            let team = await Team.findById(req.body.teamId)
            if (!team) { throw Err.teamNotFound }
            
            let joined = await memberizer.joinTeam(userInstance, team)
            if (!joined.success) { throw Err.make(joined) }
            
            await team.save()
            await userInstance.save()
            return Say.success(req.user, '[user, team]', [userInstance, team], Say.joined)

        } catch (error) { return Err.make(error) }
    }
    
    async leaveTeam (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.leaveTeam(req.user, userInstance)) { throw Err.notAuthorized }

            if (!req.body.teamId) { throw Err.missingData }
            let team = await Team.findById(req.body.teamId)
            if (!team) { throw Err.teamNotFound }
            
            let left = memberizer.leaveTeam(userInstance, team) // not async
            if (!left.success) { throw Err.make(left) }

            await team.save()
            await userInstance.save()
            return Say.success(req.user, '[user, team]', [userInstance, team], Say.leftTeam)

        } catch (error) { return Err.make(error) }
    }
    
    async makeAdmin (req) {
        try {
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.makeAdmin(req.user, userInstance)) { throw Err.notAuthorized }
            
            userInstance.makeAdmin()
            await userInstance.save()
            return Say.success(req.user, 'user', userInstance, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }

    async makeMember (req) {
        try {
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.makeMember(req.user, userInstance)) { throw Err.notAuthorized }
            
            userInstance.makeMember()
            await userInstance.save()
            return Say.success(req.user, 'user', userInstance, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = UserController
