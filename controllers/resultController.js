const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

module.exports = new Class ResultController {
    async function index (req) {
        try {
            if (!authorizer.result.index(req.user)) { throw Err.notAuthorized }
            let results = await Result.find({})
            return { Say.success('results', results) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            // authorize
            if (!authorizer.result.create(req.user)) { throw Err.notAuthorized }
        
            // check required attributes -- add validation here
            if (!req.body.raceId || !req.body.runnerId || !req.body.time) { throw Err.missingData }
            let newResult = new Result({
                time: time
            })
            
            // check if runner already has a result for this race. if not, add result to runner
            let runner = await User.findById(req.body.runnerId)
            if (!runner) { throw Err.userNotFound }
            
            let results = await Results.find({ runnerId: runner.id, raceId: race.id })
            if (results.length > 0) { throw Err.runnerHasResult }

            newResult.runnerId = runner.id
            runner.addResult(result)
            await runner.save()

            // add result to race
            let race = await Race.findById(req.body.raceId)
            if (!race) { throw Err.raceNotFound }
            newResult.raceId = race.id
            race.addResult(result)
            await race.save()
            
            // add result to runner's current team
            let team = await Team.findById(runner.currentTeamId)
            if (!team) { throw Err.teamNotFound }
            newResult.teamId = team.id
            team.addResult(result)
            await team.save()
            
            // add additional attributes
            if (req.body.note) { newResult.note = req.body.note }

            await newResult.save() 
            return { Say.success('result', newResult, Say.created) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.show(req.user, result)) { throw Err.notAuthorized }
            return { Say.success('result', result) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function update (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.update(req.user, result)) { throw Err.notAuthorized }
            
            // does not allow updating of raceId, teamId, or runnerId -- delete result and re-enter if needed
            
            // update attributes -- add validation here
            for attribute in req.body {
                if (authorizor.result.validAttributes.includes(attribute)) {
                    result[attribute] = req.body[attribute]
                }
            }

            await result.save()
            return { Say.success('result', result, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.destroy(req.user, result)) { throw Err.notAuthorized }

            // delete from all models 
            let race = await Race.findById(result.raceId)
            if (!race) { throw Err.raceNotFound }
            race.removeResult(result)
            await race.save()
            
            let team = await Team.findById(result.teamId)
            if (!team) { throw Err.teamNotFound }
            team.removeResult(result)
            await team.save()
            
            let runner = await User.findById(result.runnerId)
            if (!runner) { throw Err.userNotFound }
            runner.removeResult(result)
            await runner.save()
            
            await result.remove()
            return { Say.success(Say.destroyed) }
            
        } catch (error) { return Err.make(error) }
    }
}
