const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

module.exports = new Class RaceController {
    async function index (req) {
        try {
            if (!authorizer.race.index(req.user)) { throw Err.notAuthorized }
            let races = await Race.find({})
            return { Say.success('races', races) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            if (!authorizer.race.create(req.user)) { throw Err.notAuthorized }
        
            // add required attributes -- add validation here
            if (!req.body.year || !req.body.name || !req.body.date) { throw Err.missingData } // if missing any required data
            let newRace = new Race({
                year: req.body.year,
                name: req.body.name,
                date: req.body.date
            })

            // add additional attributes
            if (req.body.description) { newRace.description = req.body.description }
            if (req.body.startingLocation) { newRace.startingLocation = req.body.startingLocation }
            if (req.body.endingLocation) { newRace.endingLocation = req.body.endingLocation }
            
            // set coordinator
            if (req.body.coordinatorId) { 
                let coordinator = await User.findById(req.body.coordinatorId) 
                if (!coordinator) { throw Err.userNotFound }
                newRace.coordinatorId = coordinator.id
                // make this coordinator an admin here?
            }

            await newRace.save() 
            return { Say.success('race', race, Say.created) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.show(req.user, race)) { throw Err.notAuthorized }
            
            return { Say.success('race', race) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function update (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.update(req.user, race)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here
            for attribute in req.body {
                if (authorizor.race.validAttributes.includes(attribute) && attribute !== 'coordinatorId') {
                    race[attribute] = req.body[attribute]
                }
            }
            
            // handle coordinator separately
            if (req.body.coordinatorId) {
                let coordinator = await User.findById(req.body.coordinatorId) 
                if (!coordinator) { throw Err.userNotFound }
                race.coordinatorId = coordinator.id
            }
            
            await race.save()
            return { Say.success('race', race, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.destroy(req.user, race)) { throw Err.notAuthorized }
            
            // only allow deletion of a race with all teams, runners, and results removed
            if (race.runners.length > 0 || race.teams.length > 0 || race.results.length > 0) { throw Err.stillContainsData }

            // delete and return success
            await race.remove()
            return { Say.success(Say.destroyed) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function runners (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.runners(req.user, race)) { throw Err.notAuthorized }
            
            // query and return
            let runners = []
            await race.runners.forEach(async (runnerId) => {
                let runner = await User.findById(runnerId) { if (runner) { runners.push(runner) } }
            })
            return { Say.success('runners', runners) }

        } catch (error) { return Err.make(error) }
    }
    
    async function teams (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.teams(req.user, race)) { throw Err.notAuthorized }
            
            // query and return
            let teams = []
            await race.teams.forEach(async (teamId) => {
                let team = await Team.findById(teamId) { if (team) { teams.push(team) } }
            })
            return { Say.success('teams', teams) }

        } catch (error) { return Err.make(error) }
    }
    
    async function results (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.results(req.user, race)) { throw Err.notAuthorized }
            
            // query and return success
            let results = []
            await race.results.forEach(async (resultId) => {
                let result = await Result.findById(resultId) { if (result) { results.push(result) } }
            })
            return { Say.success('results', results) }

        } catch (error) { return Err.make(error) }
    }
    
    async function open (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.open(req.user, race)) { throw Err.notAuthorized }

            // open race and return
            race.open()
            await race.save()
            return { Say.success('race', race, Say.opened) }

        } catch (error) { return Err.make(error) }
    }
    
    async function archive (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.archive(req.user, race)) { throw Err.notAuthorized }

            // archive and return
            race.archive()
            await race.save()
            return { Say.success('race', race, Say.archived) }

        } catch (error) { return Err.make(error) }
    }
    
    async function setCoordinator (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.setCoordinator(req.user, race)) { throw Err.notAuthorized }

            // set coordinator
            if (!req.body.coordinatorId) { throw Err.missingData }
            let coordinator = await User.findById(req.body.coordinatorId) 
            if (!coordinator) { throw Err.userNotFound }
            race.setCoordinator(coordinator)
            // make this coordinator an admin here?

            // save updates
            await race.save()
            return { Say.success('race', race, Say.updated) }

        } catch (error) { return Err.make(error) }
    }
}
