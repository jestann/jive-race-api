const mongoose = require('mongoose')
const ObjectId = mongoose.mongo.ObjectId

const authorizer = require('./../tools/authorizer')
const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

class RaceController {
    async index (req) {
        try {
            // if (!authorizer.race.index(req.user)) { throw Err.notAuthorized }
            let races = await Race.find({})
            if (!races) { throw Err.raceNotFound }
            return Say.success('races', races)
            
        } catch (error) { return Err.make(error) }
    }

    async create (req) {
        try {
            // if (!authorizer.race.create(req.user)) { throw Err.notAuthorized }
        
            // add required attributes -- add validation here, checks for required aren't as clean as mine
            // if (!req.body.year || !req.body.name || !req.body.date) { throw Err.missingData }
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
            return Say.success('race', newRace, Say.created)
            
        } catch (error) { return Err.make(error) }
    }
    
    async show (req) {
        try {
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.show(req.user, race)) { throw Err.notAuthorized }
            
            return Say.success('race', race)
            
        } catch (error) { return Err.make(error) }
    }
    
    async update (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.update(req.user, race)) { throw Err.notAuthorized }
            
            // update attributes -- add validation here
            for (let attribute in req.body) {
                if (authorizer.race.validAttributes.includes(attribute) && attribute !== 'coordinatorId') {
                    race[attribute] = req.body[attribute]
                }
            }
            
            // handle coordinator separately
            if (req.body.coordinatorId) {
                let coordinator = await User.findById(req.body.coordinatorId) 
                if (!coordinator) { throw Err.userNotFound }
                race.coordinatorId = coordinator._id
            }
            
            await race.save()
            return Say.success('race', race, Say.updated)
            
        } catch (error) { return Err.make(error) }
    }
    
    async destroy (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.destroy(req.user, race)) { throw Err.notAuthorized }
            
            // only allow deletion of a race with all teams, runners, and results removed
            if (race.runners.length > 0 || race.teams.length > 0 || race.results.length > 0) { throw Err.stillContainsData }

            // delete and return success
            await race.remove()
            return Say.success(Say.destroyed)
            
        } catch (error) { return Err.make(error) }
    }
    
    async runners (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.runners(req.user, race)) { throw Err.notAuthorized }
            
            // query and return
            let runners = []
           for (let i=0; i < race.runners.length; i++) {
                let runner = await User.findById(race.runners[i])
                if (runner) { runners.push(runner) }
                else { runners.push(Err.userNotFound) }
            }
            return Say.success('runners', runners)

        } catch (error) { return Err.make(error) }
    }
    
    async teams (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.teams(req.user, race)) { throw Err.notAuthorized }
            
            // query and return
            let teams = []
            for (let i=0; i < race.teams.length; i++) {
                let team = await Team.findById(race.teams[i])
                if (team) { teams.push(team) }
                else { teams.push(Err.teamNotFound) }
            }
            return Say.success('teams', teams)

        } catch (error) { return Err.make(error) }
    }
    
    async results (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.results(req.user, race)) { throw Err.notAuthorized }
            
            // query and return success
            let results = []
            for (let i=0; i < race.results.length; i++) {
                let result = await Result.findById(race.results[i])
                if (result) { results.push(result) }
                else { results.push(Err.itemNotFound) }
            }
            return Say.success('results', results)

        } catch (error) { return Err.make(error) }
    }
    
    async open (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.open(req.user, race)) { throw Err.notAuthorized }

            // open race and return
            race.open()
            await race.save()
            return Say.success('race', race, Say.opened)

        } catch (error) { return Err.make(error) }
    }
    
    async archive (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.archive(req.user, race)) { throw Err.notAuthorized }

            // archive and return
            race.archive()
            await race.save()
            return Say.success('race', race, Say.archived)

        } catch (error) { return Err.make(error) }
    }
    
    async setCoordinator (req) {
        try {
            // authorize
            let race = await Race.findById(req.params['id'])
            if (!race) { throw Err.raceNotFound }
            // if (!authorizer.race.setCoordinator(req.user, race)) { throw Err.notAuthorized }

            // set coordinator
            if (!req.body.coordinatorId) { throw Err.missingData }
            let coordinator = await User.findById(req.body.coordinatorId) 
            if (!coordinator) { throw Err.userNotFound }
            race.setCoordinator(coordinator)
            // make this coordinator an admin here?

            // save updates
            await race.save()
            return Say.success('race', race, Say.updated)

        } catch (error) { return Err.make(error) }
    }
}

module.exports = RaceController