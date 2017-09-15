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
    runners: [User.schema],
    teams: [Team.schema],
    results: [Result.schema]
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
    this.isCurrent = true
}

// archive this race
raceSchema.methods.archive = function () {
    this.isCurrent = false
}

raceSchema.methods.setCoordinator = function (user) {
    this.coordinator = user
}


// CALLED FROM REGISTRAR

// adds a runner
raceSchema.methods.addRunner = function (user) {
    this.runners.push(user)
    // also add race to runner -- done in registrar
}

// removes a runner
raceSchema.methods.removeRunner = function (user) {
    this.runners = this.runners.filter((runner) => { runner.id !== user.id })
    // also remove race from runner -- done in registrar
}


// CALLED FROM TEAM CONTROLLER

// adds a team
raceSchema.methods.addTeam = function (team) {
    this.teams.push(team)
    // also adds race to team -- called from team create/update method
}

// removes a team
raceSchema.methods.removeTeam = function (team) {
    this.teams = this.teams.filter((item) => { item.id !== team.id })
    // also remove race from team -- called from team update/delete method
}


// CALLED FROM RESULT CONTROLLER

raceSchema.methods.addResult = function (result) {
    this.results.push(result)
    // also add race to result -- done in result controller
}

raceSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((item) => { item.id !== result.id })
    // also remove race from result -- done in result controller
}



// CALLED FROM RANKING TOOL TO BE CREATED

raceSchema.methods.rank = function () {
    /* rank teams */
    /* rank individuals */
}

const raceModel = mongoose.model('Race', raceSchema)

module.exports = { schema: raceSchema, model: raceModel }