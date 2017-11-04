const Err = require('./../config/error')
const Say = require('./../config/message')
const authorizer = require('./../tools/authorizer')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

class authTestController {
    async getAuth (req) {
        try {
            if (!req.body.userId) { throw Err.missingData }
            let user = await User.findById(req.body.userId)
            if (!user) { throw Err.userNotFound }

            let model = req.params['model']
            let action = req.params['action']
            let auth = null
            
            // index and create authorization
            if (action === 'index' || action === 'create' ) {
                auth = authorizer[model][action](user)
            } 
            
            // getting arrays of required or valid attributes
            else if (action.includes('Attributes')) {
                auth = authorizer[model][action]
            } 
            
            // model instance-specific authorization
            else {
                if (!req.body.modelId) { throw Err.missingData }
                let modelInstance = null
                switch (model) {
                    case 'user':
                        modelInstance = await User.findById(req.body.modelId)
                        break
                    case 'race':
                        modelInstance = await Race.findById(req.body.modelId)
                        break
                    case 'team':
                        modelInstance = await Team.findById(req.body.modelId)
                        break
                    case 'result':
                        modelInstance = await Result.findById(req.body.modelId)
                }
                if (!modelInstance) { throw Err.itemNotFound } 
                auth = authorizer[model][action](user, modelInstance)
            }
            
            // return the authorization or attributes array
            if (!auth) { throw Err.authTestError }
            return Say.success(undefined, 'auth', auth)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = authTestController