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
            // authorize
            if (!authorizer.race.index(req.user)) { throw Err.notAuthorized }
            
            // query and return
            let races = await Race.find({})
            return { Say.success('races', races) }
            
        } catch (error) { return Err.make(error) }
    }

    async function create (req) {
        try {
            // authorize
            if (!authorizer.race.create(req.user)) { throw Err.notAuthorized }
        
            // add required attributes -- add validation here
            if (!req.body.year || !req.body.name || !req.body.date) { throw Err.missingData } // if missing any required data
            let year = req.body.year
            let name = req.body.name
            let date = req.body.date

            // create new race
            let newRace = new Race({
                year: year,
                name: name,
                date: date
            })

            // add additional attributes
            if (req.body.description) { newRace.description = req.body.description }
            if (req.body.startingLocation) { newRace.startingLocation = req.body.startingLocation }
            if (req.body.endingLocation) { newRace.endingLocation = req.body.endingLocation }
            
            // set coordinator
            if (req.body.coordinator) { 
                let coordinator = await User.findById(req.body.coordinator.id) 
                if (!coordinator) { throw Err.userNotFound }
                newRace.coordinator = coordinator
                // make this coordinator an admin here?
            }

            // save and return
            let savedRace = await newRace.save() 
            return { Say.success('race', savedRace, Say.created) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function show (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.show(req.user, race)) { throw Err.notAuthorized }
            
            // return instance
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
            for attribute in req.body.raceData {
                if (authorizor.race.validAttributes.includes(attribute) && attribute !== 'coordinator') {
                    race[attribute] = req.body.raceData[attribute]
                }
            }
            
            // handle coordinator separately
            if (req.body.raceData.coordinator) {
                let coordinator = await User.findById(req.body.raceData.coordinator.id) 
                if (!coordinator) { throw Err.userNotFound }
                race.coordinator = coordinator
            }

            // save updates
            let savedRace = await race.save()
            return { Say.success('race', savedRace, Say.updated) }
            
        } catch (error) { return Err.make(error) }
    }
    
    async function destroy (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.destroy(req.user, race)) { throw Err.notAuthorized }

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
            let runners = race.runners
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
            let teams = race.teams
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
            let results = race.results
            return { Say.success('results', results) }

        } catch (error) { return Err.make(error) }
    }
    
    async function setCoordinator (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            if (!authorizer.race.setCoordinator(req.user, race)) { throw Err.notAuthorized }

            // set coordinator
            if (!req.body.coordinator) { throw Err.missingData }
            let coordinator = await User.findById(req.body.coordinator.id) 
            if (!coordinator) { throw Err.userNotFound }
            race.setCoordinator(coordinator)
            // make this coordinator an admin here?

            // save updates
            let savedRace = await race.save()
            return { Say.success('race', savedRace, Say.updated) }

        } catch (error) { return Err.make(error) }
    }
}
