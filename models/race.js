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
    isCurrent: Boolean, // open for registration
    runners: [User.schema]
})

// can't use arrow functions here
raceSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

// open for registration
raceSchema.methods.open = function () {
    this.isCurrent = true
}

// archive this race
raceSchema.methods.archive = function () {
    this.isCurrent = false
}

raceSchema.methods.setCoordinator = function (user) {
    this.coordinator = user
}

raceSchema.methods.isRunner = function (user) {
    this.runners.forEach( (runner) => { if (runner.id === user.id) { return true } })
}

// adds a runner
raceSchema.methods.addRunner = function (user) {
    this.runners.push(user)
}

// removes a runner
raceSchema.methods.removeRunner = function (user) {
    this.runners = this.runners.filter((runner) => { runner.id !== user.id })
}

raceSchema.methods.rank = function () {
    /* rank teams */
    /* rank individuals */
}

const raceModel = mongoose.model('Race', raceSchema)

module.exports = { schema: raceSchema, model: raceModel }