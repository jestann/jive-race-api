const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.mongo.ObjectId

const Race = './race'
const Team = './team'
const Result = './result'
const Err = './../config/error'

const userSchema = new Schema({
    // _id gives object, .id gives string
    createdAt: Date,
    updatedAt: Date,
    inactivatedAt: { type: Date, default: null },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'member' }, // three roles currently available 'member' and 'admin' + 'inactive'
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
    races: [ObjectId], // array of race ids
    teams: [ObjectId], // array of team ids
    results: [ObjectId], // array of result ids
    currentRaceId: { type: ObjectId, default: null }, // id of last race registered
    dateRegistered: Date, // date last registered
    currentTeamId: { type: ObjectId, default: null } // id of current team
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

// registered for the current race? user.isCurrent() // this method got moved to memberizer
// FIXED: what if the last race they registered for isn't current, but one of their races is?

userSchema.methods.isRunningRace = function (race) {
    return this.races.includes(race.id)
}

userSchema.methods.isRunningRaceId = function (raceId) {
    return this.races.includes(raceId)
}

userSchema.methods.isOnTeam = function (team) {
    return this.teams.includes(team.id)
}

userSchema.methods.isOnTeamId = function (teamId) {
    return this.teams.includes(teamId)
}

userSchema.methods.owns = function (team) {
    if (team.ownerId === this.id) { return true }
    return false
}



// CALLED FROM REGISTRAR

// registers user for a specific race
userSchema.methods.register = function (race) {
    if (race.isCurrent) { 
        this.currentRaceId = race.id
        this.dateRegistered = new Date()
        this.currentTeamId = null
    }
    this.races.push(race.id)
    // also must add runner to race object -- done in registrar
}

// removes a user from a current or past race
userSchema.methods.unregister = function (race) {
    if (this.currentRaceId === race.id) { 
        this.currentRaceId = null 
        this.dateRegistered = null
        this.currentTeamId = null
    }
    this.races = this.races.filter((raceId) => {raceId !== race.id})
    // also must remove runner from race object -- done in registrar
}

// this is done instead of deleting users: it disallows authentication and authorization and deletes user data but retains past race data
userSchema.methods.inactivate = function () {
    this.role = 'inactive'
    this.inActivatedAt = new Date()
    
    // retains first name, last name, birthdate, and email for record keeping purposes
    this.username = null
    this.password = null
    this.bio = null
    this.photo = null
    this.address = null
    this.city = null
    this.state = null
    this.zip = null
    this.phone = null
    this.currentRaceId = null
    this.currentTeamId = null
    // would also need to remove them from their current team list -- done in registrar
}



// CALLED FROM MEMBERIZER

// leave past or present team as a member -- to leave as an owner, must transfer ownership via team.transfer first
userSchema.methods.memberLeaveTeam = function (team) {
    if (!this.owns(team)) {
        if (team.id === this.currentTeamId) {
            this.currentTeamId = null
        }
        this.teams = this.teams.filter((teamId) => teamId !== team.id)
    }
    // also must remove user from team list -- done in memberizer
}

// join a new team as a member - doesn't work easily with a past race -- FIX?
userSchema.methods.memberJoinTeam = function (team) {
    if (team.race.isCurrent) {
        // must be registered for the race and leave the current team first
        if (this.currentRaceId === team.race.id && !this.currentTeamId) {
            this.currentTeamId = team.id
            this.teams.push(team.id)
        }
    // if it's a past race, must have been part of that race
    } else if (this.races.includes(team.race.id)) {
        this.teams.push(team.id)
        // allows multiple memberships per past race
        // or can specifically search for and remove past team membership for that race
    }
    // also add member to team list -- done in memberizer
}



// CALLED FROM RESULT CONtROLLER

userSchema.methods.addResult = function (result) {
    this.results.push(result.id)
    // also add user to result -- done in result controller
}

userSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((resultId) => { resultId !== result.id })
    // also remove user from result -- done in result controller
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }