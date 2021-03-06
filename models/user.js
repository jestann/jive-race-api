const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const ObjIdConst = mongoose.mongo.ObjectId

const Race = './race'
const Team = './team'
const Result = './result'
const Err = './../config/error'

const userSchema = new Schema({
    // _id gives ObjectId
    createdAt: Date,
    updatedAt: Date,
    inactivatedAt: Date,
    email: { type: String, required: true, unique: true }, // only contact info saved when inactivating users
    username: { type: String, unique: true }, // not required in mongoose to allow for inactivating users
    password: { type: String }, // not required in mongoose to allow for inactivating users
    role: { type: String, required: true, default: 'member' }, // three roles currently available: 'member' 'admin' and 'inactive'
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
    isCurrent: Boolean, // if paid to register for a currently open race
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

userSchema.methods.isActive = function () {
    if (this.role !== 'inactive') { return true }
    return false
}

// used in authorizor, also checks to make sure the user has not been "deleted" or made inactive
userSchema.methods.isSelf = function (user) {
    if ((this._id.toString() === user._id.toString()) && this.isActive()) { return true }
    return false
}

userSchema.methods.isRunningRace = function (race) {
    let registered = false
    this.races.forEach((raceId) => { 
        if (raceId.toString() === race._id.toString()) { registered = true } 
    })
    return registered
}

userSchema.methods.isCurrentRace = function (race) {
    return (this.currentRaceId.toString() === race._id.toString())
}

userSchema.methods.isCurrentRaceOfTeam = function (team) {
    return (this.currentRaceId.toString() === team.raceId.toString())
}

userSchema.methods.isOnTeam = function (team) {
    let memberized = false
    this.teams.forEach((teamId) => {
        if (teamId.toString() === team._id.toString()) { memberized = true }
    })
    return memberized
}

userSchema.methods.isCurrentTeam = function (team) {
    return (this.currentTeamId.toString() === team._id.toString())
}

userSchema.methods.owns = function (team) {
    return (this._id.toString() === team.ownerId.toString())
}

userSchema.methods.ownsResult = function (result) {
    return (this._id.toString() === result.runnerId.toString())
}

// compare strings because of ObjectId's equivalency issues



// CALLED FROM REGISTRAR

// registers user for a specific race
userSchema.methods.register = function (race) {
    if (race.isOpen) { 
        this.currentRaceId = race._id
        this.dateRegistered = new Date()
        this.currentTeamId = null
        this.isCurrent = true
    }
    if (!this.isRunningRace(race)) { this.races.push(race._id) }
    // also must add runner to race object -- done in registrar
}

// removes a user from a current or past race
userSchema.methods.unregister = function (race) {
    if (this.currentRaceId.toString() === race._id.toString()) { 
        this.currentRaceId = null 
        this.dateRegistered = null
        this.currentTeamId = null
        this.isCurrent = false
    }
    this.races = this.races.filter((raceId) => raceId.toString() !== race._id.toString() )
    // also must remove runner from race object -- done in registrar
}

// resets a user's current team after a user's current race closes -- leaves the user as a team member though
userSchema.methods.closeRace = function (race) {
    if (this.isCurrentRace(race)) { 
        // remove current race?
        // remove date registered?
        this.currentTeamId = null 
        this.isCurrent = false
    }
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
    this.isCurrent = false
    this.currentRaceId = null
    this.currentTeamId = null
    // would also need to remove them from their current team list -- done in registrar
}



// CALLED FROM MEMBERIZER

// leave past or present team as a member -- to leave as an owner, must transfer ownership via team.transfer first
userSchema.methods.leaveTeam = function (team) {
    if (!this.owns(team)) {
        if (team._id.toString() === this.currentTeamId.toString()) {
            this.currentTeamId = null
        }
        this.teams = this.teams.filter((teamId) => teamId.toString() !== team._id.toString())
    }
    // also must remove user from team list -- done in memberizer
}

// join a new team as a member -- only allowed on current race -- checked in memberizer
userSchema.methods.joinTeam = function (team, race) {
    // find out if registered for it -- cannot just use this.races.includes(race._id) because of ObjectId's equivalency issues
    let registered = false
    this.races.forEach((raceId) => {
        if (raceId.toString() === race._id.toString()) { registered = true }
    })
    
    // must be registered for the race
    if (registered) {
        // if current, must be registered for it and leave the current team first
        if ((this.currentRaceId.toString() === race._id.toString()) && !this.currentTeamId) {
            this.currentTeamId = team._id
        }
        if (!this.isOnTeam(team)) { this.teams.push(team._id) }
        // allows multiple memberships per past race
        // or can specifically search for and remove past team membership for that race
    }
    // also add member to team list -- done in memberizer
}



// CALLED FROM RESULT CONtROLLER

userSchema.methods.addResult = function (result) {
    let alreadyAdded = false
    this.results.forEach((resultId) => {
        if (resultId.toString() === result._id.toString()) { alreadyAdded = true }
    })
    if (!alreadyAdded) { this.results.push(result._id) }
    // also add user to result -- done in result controller
}

userSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((resultId) => resultId.toString() !== result._id.toString() )
    // also remove user from result -- done in result controller
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }