const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

class ResultController {
    async index (req) {
        try {
            if (!authorizer.result.index(req.user)) { throw Err.notAuthorized }
            let results = await Result.find({})
            return Say.success('results', results)
            
        } catch (error) { return Err.make(error) }
    }

    async create (req) {
        try {
            // authorize
            if (!authorizer.result.create(req.user)) { throw Err.notAuthorized }
        
            // check required attributes -- add validation here, their checks for required data aren't as clean as mine
            if (!req.body.raceId || !req.body.runnerId || !req.body.time) { throw Err.missingData }
            
            // check to make sure runner doesn't already have a result for this race
            let runner = await User.findById(req.body.runnerId)
            if (!runner) { throw Err.userNotFound }
            
            // check if runner is registered for that race
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            if (!runner.isRunningRace(race)) { throw Err.notRegistered }

            let results = await Result.find({ runnerId: runner._id.toString(), raceId: race._id.toString() }) // could fail due to ObjectId equivalency issues
            if (results.length > 0) { throw Err.runnerHasResult }

            let team = await Team.findById(runner.currentTeamId)
            if (!team) { throw Err.teamNotFound }

            // add attributes
            let newResult = new Result({ time: req.body.time })
            if (req.body.note) { newResult.note = req.body.note }
            newResult.runnerId = runner._id
            newResult.raceId = race._id
            newResult.teamId = team._id

            runner.addResult(newResult)
            race.addResult(newResult)
            team.addResult(newResult)

            await newResult.save() 
            await race.save()
            await team.save()
            await runner.save()
            return Say.success('result', newResult, Say.created)
            
        } catch (error) { return Err.make(error) }
    }
    
    async show (req) {
        try {
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.show(req.user, result)) { throw Err.notAuthorized }
            return Say.success('result', result)
            
        } catch (error) { return Err.make(error) }
    }
    
    async update (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.update(req.user, result)) { throw Err.notAuthorized }
            
            // does not allow updating of raceId, teamId, or runnerId -- delete result and re-enter if needed

            // update attributes -- add validation here
            for (let attribute in req.body) {
                if (authorizer.result.validAttributes.includes(attribute)) {
                    result[attribute] = req.body[attribute]
                }
            }

            await result.save()
            return Say.success('result', result, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
    
    async destroy (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.destroy(req.user, result)) { throw Err.notAuthorized }

            // delete from all models 
            let race = await Race.findById(result.raceId)
            if (!race) { throw Err.raceNotFound }
            
            let team = await Team.findById(result.teamId)
            if (!team) { throw Err.teamNotFound }
            
            let runner = await User.findById(result.runnerId)
            if (!runner) { throw Err.userNotFound }

            race.removeResult(result)
            team.removeResult(result)
            runner.removeResult(result)
            await race.save()
            await team.save()
            await runner.save()

            await result.remove()
            return Say.success(Say.destroyed)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = ResultController
