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


// CALLED FROM MEMBERIZER

// leave past or present team as a member -- to leave as an owner, must transfer ownership via team.transfer
userSchema.methods.memberLeaveTeam = function (team) {
    // check they don't own the team
    if (!this.owns(team)) {
        // if it's their current team
        if (team.id === this.currentTeam.id) {
            this.currentTeam = null   
        }
        this.teams = this.teams.filter((item) => item.id !== team.id)
    }
    // also must remove user from team list -- done in memberizer
}

// join a new team as a member - doesn't work easily with a past race -- FIX?
userSchema.methods.joinTeam = function (team) {
    // if it's a current race
    if (team.race.isCurrent) {
        // must be registered for the race and leave the current team first
        if (this.currentRace === team.race && !this.currentTeam) {
            this.currentTeam = team
            this.teams.push(team)
        }
    // if it's a past race, must have been part of that race
    } else if (this.races.includes(team.race)) {
        this.teams.push(team)
        // allows multiple memberships per past race
        // or can specifically search for and remove past team membership for that race
    }
    // also add member to team list -- done in memberizer
}



// CALLED FROM RESULT CONtROLLER

userSchema.methods.addResult = function (result) {
    this.results.push(result)
    // also add user to result -- done in result controller
}

userSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((item) => { item.id !== result.id })
    // also remove user from result -- done in result controller
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }