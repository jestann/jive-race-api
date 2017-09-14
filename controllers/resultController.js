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
            // authorize
            if (!authorizer.result.index(req.user)) { throw Err.notAuthorized }
            
            // query and return
            let results = await Result.find({})
            return { Say.success('results', results) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            // authorize
            if (!authorizer.result.create(req.user)) { throw Err.notAuthorized }
        
            // check required attributes -- add validation here
            if (!req.body.race || !req.body.team || !req.body.runner || !req.body.time) { throw Err.missingData } // if missing any required data
            
            let race = await Race.findById(req.body.race.id)
            if (!race) { throw Err.raceNotFound }
            
            let team = await Team.findById(req.body.team.id)
            if (!team) { throw Err.teamNotFound }
            
            let runner = await User.findById(req.body.runner.id)
            if (!runner) { throw Err.userNotFound }
            
            // create new team
            let newResult = new Result({
                race: race,
                team: team,
                runner: runner,
                time: time
            })
            
            // add additional attributes
            if (req.body.note) { newResult.note = req.body.note }
            
            // update race, team, and runner
            race.addResult(newResult)
            team.addResult(newResult)
            runner.addResult(newResult)

            // save and return
            await race.save()
            await team.save()
            await runner.save()
            let savedResult = await newResult.save() 
            return { Say.success('result', savedResult, Say.created) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.show(req.user, result)) { throw Err.notAuthorized }
            
            // return instance
            return { Say.success('result', result) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function update (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.update(req.user, result)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here
            if (req.body.time) { result.time = req.body.time }
            if (req.body.note) { result.note = req.body.note }
            
            if (req.body.race) {
                let race = await Race.findById(req.body.race.id) 
                if (!race) { throw Err.raceNotFound }
                result.race = race
            }
            
            if (req.body.team) {
                let team = await Team.findById(req.body.team.id)
                if (!team) { throw Err.teamNotFound }
                result.team = team
            }
            
            if (req.body.runner) {
                let runner = await User.findById(req.body.runner.id)
                if (!runner) { throw Err.userNotFound }
                result.runner = runner
            }

            // save updates
            let savedResult = await result.save()
            return { Say.success('result', savedResult, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let result = await Result.findById(req.params['id'])
            if (!result) { throw Err.itemNotFound }
            if (!authorizer.result.destroy(req.user, result)) { throw Err.notAuthorized }

            // delete and return success
            await result.remove()
            return { Say.success(Say.destroyed) }
            
        } catch (error) { return Err.make(error) }
    }
}
