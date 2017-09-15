const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './race'
const Team = './team'
const Result = './result'
const Err = './../config/error'

const userSchema = new Schema({
    // _id gives object, .id gives string
    createdAt: Date,
    updatedAt: Date,
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'member' }, // two roles currently available 'member' and 'admin'
    firstName: String,
    lastName: String,
    bio: String,
    photo: String, // use gravatar?
    birthdate: Date,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    races: [Race.schema],
    teams: [Team.schema],
    results: [Result.schema],
    currentRace: { type: Race.schema, default: null }, // last race registered
    dateRegistered: Date, // date last registered
    currentTeam: { type: Team.schema, default: null } // current team
})

// can't use arrow functions here because of 'this' syntax
userSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

userSchema.methods.makeMember = function () {
    this.role = 'member'
}

userSchema.methods.isMember = function () {
    if (this.role === 'member' || this.role === 'admin') { return true }
    return false
}

userSchema.methods.makeAdmin = function () {
    this.role = 'admin'
}

userSchema.methods.isAdmin = function () {
    if (this.role === 'admin') { return true }
    return false
}

// registered for the current race?
// FIX - what if the last race they registered for isn't current, but one of their races is?
userSchema.methods.current = function () {
    return this.currentRace.isCurrent()
}

userSchema.methods.owns = function (team) {
    if (team.owner.id === this.id) { return true }
    return false
}

// registers user for a specific race
userSchema.methods.register = function (race) {
    if (race.open())
    this.currentRace = race
    this.dateRegistered = new Date()
    this.currentTeam = null
    // also must add runner to race object -- done in registrar
}

// removes a user from any race, current or past
userSchema.methods.unregister = function (race) {
    // remove a user from the current race
    if (this.currentRace.id === race.id) { 
        this.currentRace = null 
        this.dateRegistered = null
        this.currentTeam = null
    }
    this.races = this.races.filter((item) => {item.id !== race.id})
    // also must remove runner from race object -- done in registrar
}



// ONLY CALLED FROM MEMBERIZER

// leave a team as a member
userSchema.methods.memberLeaveTeam = function (team) {
    if (team.id = this.currentTeam.id) {
        // check they don't own their current team
        if (!this.owns(this.currentTeam)) {
            this.currentTeam = null   
        }
    }
    this.teams = this.teams.filter((item) => item.id !== team.id)
    // also must remove user from team list -- done in memberizer
    }
}

// to leave a team as an owner, first transfer ownership via team.transfer

// join a new team as a member // assumes only join teams on current race -- FIX?
userSchema.methods.joinTeam = function (team) {
    if (this.current()) {
        // must leave a team first
        if (!this.currentTeam) {
            this.teams.push(team)
            this.currentTeam = team
        }
    }
    // also add member to team list -- done in memberizer
}



// ONLY CALLED FROM RESULTS CONtROLLER

userSchema.methods.addResult = function (result) {
    this.results.push(result)
    // also add user to result
}

userSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((item) => { item.id !== result.id })
    // also remove user from result
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }