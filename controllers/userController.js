const bcrypt = require('bcrypt')
const validator = require('validator')
const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

module.exports = new Class UserController {
    async function index (req) {
        try {
            // authorize
            if (!authorizer.user.index(req.user)) { throw Err.notAuthorized }
            
            // query and return
            let users = await User.find({})
            return Say.success('users', users)
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            // authorize
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
            let savedUser = await newUser.save() 
            return Say.success('user', savedUser, Say.created)
            
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
            for attribute in req.body.userData {
                if (authorizor.user.validSelfAttributes.includes(attribute) && attribute !== 'password') { 
                    userInstance[attribute] = req.body.userData[attribute]
                }
            }
            // handle password separately
            if (req.body.userData.password) { userInstance.password = await bcrypt.hash(req.body.password, 10) }

            // administrative updates if allowed
            if (authorize.user.updateAdmin(req.user, userInstance)) {
                for attribute in req.body.userData {
                    if (authorizor.user.validAdminAttributes.includes(attribute)) { userInstance[attribute] = req.body.userData[attribute] }
                }
            }

            // save updates
            let savedUser = await userInstance.save()
            return Say.success('user', savedUser, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.destroy(req.user, userInstance)) { throw Err.notAuthorized }

            // delete and return success
            await userInstance.remove()
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
            let races = userInstance.races
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
            let teams = userInstance.teams
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
            let results = userInstance.results
            return Say.success('results', results)

        } catch (error) { return Err.make(error) }
    }
    
    async function register (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.register(req.user, userInstance)) { throw Err.notAuthorized }

            // payment will be taken care of prior to this step
            // it will be handled through a separate payment controller before this route is called
            
            // register user and add runner to race
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            userInstance.register(race)
            race.addRunner(userInstance) // should this be handled here or within user.register?

            // save updates
            let savedUser = await userInstance.save()
            let savedRace = await race.save()
            return Say.success('user', savedUser, Say.registered)

        } catch (error) { return Err.make(error) }
    }

    async function joinTeam (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.joinTeam(req.user, userInstance)) { throw Err.notAuthorized }

            // join team
            let team = await Team.findById(req.body.teamId)
            if (!team) { throw Err.teamNotFound }
            userInstance.joinTeam(team)
            team.addMember(userInstance) // should this be handled here or within user.joinTeam?

            // save updates
            let savedUser = await userInstance.save()
            let savedTeam = await team.save()
            return Say.success('user', savedUser, Say.joined)

        } catch (error) { return Err.make(error) }
    }
    
    async function makeAdmin (req) {
        try {
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.makeAdmin(req.user, userInstance)) { throw Err.notAuthorized }
            
            // make user admin and save and return
            userInstance.makeAdmin()
            let savedUser = await userInstance.save()
            return Say.success('user', savedUser, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }

    async function makeMember (req) {
        try {
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.userNotFound }
            if (!authorizer.user.makeMember(req.user, userInstance)) { throw Err.notAuthorized }
            
            // downgrade user to member and save and return
            userInstance.makeMember()
            let savedUser = await userInstance.save()
            return Say.success('user', savedUser, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
}
