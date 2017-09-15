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
    currentRace: { type: Race.schema, default: null }, // last race registered // is this a reserved word?
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

// registers for a specific race 
userSchema.methods.register = function (race) {
    this.currentRace = race
    this.dateRegistered = new Date()
    this.currentTeam = null
    race.addRunner(this) // also must add runner to race object
}

// test if owner first
userSchema.methods.leaveTeam = function (team) {
    if (this.currentTeam) {
        if (this.owns(this.currentTeam)) {
            return { Err.transferOwnership }
        }
        
        // remove team from teams array
        this.teams = this.teams.filter((team) => team.id !== this.currentTeam.id)

        // remove member from team list
        this.currentTeam.members = this.currentTeam.members.filter((member) => member.id !== this.id)
        
        // empty currentTeam
        this.currentTeam = null
    }
}

// this also removes the  
userSchema.methods.joinTeam = function (team) {
    if (this.current) {
        if (this.currentTeam) { this.leaveTeam() } // if already on a team
        this.teams.push(team)
        this.currentTeam = team
        
        this.currentTeam.addMember(this) // add to team list
    }
}

userSchema.methods.addResult = function (result) {
    this.results.push(result)
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }