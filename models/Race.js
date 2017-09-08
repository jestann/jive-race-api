const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Team = './Team'
const User = './User'
const Result = './Result'

const raceSchema = new Schema({
    id: Number, // does this need to be explicitly named or is it auto-generated?
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

// example method
raceSchema.methods.teams = function () {
  let message = this.year
    ? "This race is for the year " + this.year + "."
    : "No listed year."
  console.log(message)
}

const raceModel = mongoose.model('Race', raceSchema)

module.exports = { schema: raceSchema, model: raceModel }