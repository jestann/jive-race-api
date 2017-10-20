const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

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
    coordinatorId: ObjectId, // user id of coordinator
    isOpen: Boolean, // open for registration
    runners: [ObjectId], // array of user ids
    teams: [ObjectId], // array of team ids
    results: [ObjectId] // array of result ids
})

// can't use arrow functions here
raceSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

// open this race for registration
raceSchema.methods.open = function () {
    this.isOpen = true
}

// archive this race
raceSchema.methods.archive = function () {
    this.isOpen = false
    // also must closeRace() for all its runners, done from raceController's archive function
}

raceSchema.methods.setCoordinator = function (user) {
    this.coordinatorId = user._id
}


// CALLED FROM REGISTRAR

// adds a runner
raceSchema.methods.addRunner = function (user) {
    let registered = false
    this.runners.forEach((runnerId) => {
        if (runnerId.toString() === user._id.toString()) { registered = true }
    })
    if (!registered) { this.runners.push(user._id) }
    // also add race to runner -- done in registrar
}

// removes a runner
raceSchema.methods.removeRunner = function (user) {
    this.runners = this.runners.filter((runnerId) => runnerId.toString() !== user._id.toString() )
    // also remove race from runner -- done in registrar
}


// CALLED FROM TEAM CONTROLLER

// adds a team
raceSchema.methods.addTeam = function (team) {
    let added = false
    this.teams.forEach((teamId) => {
        if (teamId.toString() === team._id.toString()) { added = true }
    })
    if (!added) { this.teams.push(team._id) }
    // also adds race to team -- called from team create/update method
}

// removes a team
raceSchema.methods.removeTeam = function (team) {
    this.teams = this.teams.filter((teamId) => teamId.toString() !== team._id.toString() )
    // also remove race from team -- called from team update/delete method
}


// CALLED FROM RESULT CONTROLLER

raceSchema.methods.addResult = function (result) {
    let added = false
    this.results.forEach((resultId) => {
        if (resultId.toString() === result._id.toString()) { added = true }
    })
    if (!added) { this.results.push(result._id) }
    // also add race to result -- done in result controller
}

raceSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((resultId) => resultId.toString() !== result._id.toString() )
    // also remove race from result -- done in result controller
}



// CALLED FROM RANKING TOOL TO BE CREATED

raceSchema.methods.rank = function () {
    /* rank teams */
    /* rank individuals */
}

const raceModel = mongoose.model('Race', raceSchema)

module.exports = { schema: raceSchema, model: raceModel }