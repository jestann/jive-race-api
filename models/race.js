const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Team = './team'
const User = './user'
const Result = './result'

const raceSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    year: String,
    name: String,
    description: String,
    date: Date,
    startingLocation: String,
    endingLocation: String,
    coordinator: String,
    runners: [User.schema],
    teams: [Team.schema],
    results: [Result.schema] // easy querying of results might require additional fields
})


raceSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

const raceModel = mongoose.model('Race', raceSchema)

module.exports = { schema: raceSchema, model: raceModel }