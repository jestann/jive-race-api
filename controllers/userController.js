const bcrypt = require('bcrypt')
const validator = require('validator')
const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')
const User = require('./../models/user').model

module.exports = {
    async function index (req) {
        try {
            // authorize
            if (!authorizer.user.index(req.user)) { throw Err.notAuthorized }
            
            // query and return
            let users = await User.find({})
            return { Say.success('users', users) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            // authorize
            if (!authorizer.user.create(req.user)) { throw Err.notAuthorized }
        
            // add validation here        
            let email = req.body.email
            let username = req.body.username
            let passwordHash = await bcrypt.hash(req.body.password, 10)

            // create and save
            let newUser = new User({
                email: email,
                username: username,
                password: passwordHash
            })
            let savedUser = await newUser.save() 
            return { Say.success('user', savedUser, Say.saved) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.show(req.user, userInstance)) { throw Err.notAuthorized }
            
            // return instance
            return { Say.success('user', userInstance) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function update (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.updateSelf(req.user, userInstance)) { throw Err.notAuthorized }
            
            // add validation here
            for attribute in req.body.userData {
                if (authorizor.user.validSelfAttributes.includes(attribute) { user[attribute] = req.body.userData[attribute] }
            }
            if (req.body.userData.password) { user.password = await bcrypt.hash(req.body.password, 10) }

            // administrative updates if allowed
            if (authorize.user.updateAdmin(req.user, userInstance)) {
                for attribute in req.body.userData {
                    if (authorizor.user.validAdminAttributes.includes(attribute) { user[attribute] = req.body.userData[attribute] }
                }
            }

            // save updates
            let savedUser = await userInstance.save()
            return { Say.success('user', savedUser, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.destroy(req.user, userInstance)) { throw Err.notAuthorized }

            // delete and return success
            await userInstance.remove()
            return { Say.success(Say.destroyed) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function races (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.races(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return
            let races = userInstance.races
            return { Say.success('races', races) }

        } catch (error) { return Err.make(error) }
    }
    
    async function teams (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.teams(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return
            let teams = userInstance.teams
            return { Say.success('teams', teams) }

        } catch (error) { return Err.make(error) }
    }
    
    async function results (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.results(req.user, userInstance)) { throw Err.notAuthorized }
            
            // query and return success
            let results = userInstance.results
            return { Say.success('results', results) }

        } catch (error) { return Err.make(error) }
    }
    
    async function register (req) {
        async function races (req) {
        try {
            // authorize
            let userInstance = await User.findById(req.params['id'])
            if (!userInstance) { throw Err.itemNotFound }
            if (!authorizer.user.register(req.user, userInstance)) { throw Err.notAuthorized }
            
            // register and return
            userInstance = userInstance.races
            return { Say.success('races', races) }
            
                        // add validation here
            for attribute in req.body.userData {
                if (authorizor.user.validSelfAttributes.includes(attribute) { user[attribute] = req.body.userData[attribute] }
            }
            if (req.body.userData.password) { user.password = await bcrypt.hash(req.body.password, 10) }

            // administrative updates if allowed
            if (authorize.user.updateAdmin(req.user, userInstance)) {
                for attribute in req.body.userData {
                    if (authorizor.user.validAdminAttributes.includes(attribute) { user[attribute] = req.body.userData[attribute] }
                }
            }

            // save updates
            let savedUser = await userInstance.save()
            return { Say.success('user', savedUser, Say.updated) }


        } catch (error) { return Err.make(error) }
    }
    }
    
}
