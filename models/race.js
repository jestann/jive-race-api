const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const User = './user'
const Team = './team'
const Result = './result'

const raceSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    year: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    startingLocation: String,
    endingLocation: String,
    coordinator: User.schema,
    runners: [User.schema],
    teams: [Team.schema],
    results: [Result.schema] // easy querying of results might require additional fields
})

// can't use arrow functions here
raceSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

raceSchema.methods.setCoordinator = function (user) {
    this.coordinator = user
}

raceSchema.methods.addRunner = function (user) {
    this.runners.push(user)
    // also add race to runner -- done in registrar
}

raceSchema

raceSchema.methods.addTeam = function (team) {
    this.teams.push(team)
}

raceSchema.methods.addResult = function (result) {
    this.results.push(result)
}

raceSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((item) => { item.id !== result.id })
}

raceSchema.methods.rank = function () {
    /* rank teams */
    /* rank individuals */
}

const raceModel = mongoose.model('Race', raceSchema)

module.exports = { schema: raceSchema, model: raceModel }