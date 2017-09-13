const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './race'
const Team = './team'
const Result = './result'

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
    current: Boolean, // registered for current race ... is this a reserved word?
    dateRegistered: Date,
    teams: [Team.schema],
    currentTeam: Team.schema,
    results: [Result.schema]
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

// registers for a specific race
userSchema.methods.register = function (race) {
    this.races.push(race)
    this.current = true
    this.dateRegistered = new Date()
    this.currentTeam = null
    // race.addRunner(this) // also call race.addRunner on this user here? leave that to the controller.
}

userSchema.methods.joinTeam = function (team) {
    if (this.current) {
        if (this.currentTeam) {
            if (this.currentTeam.owner = this) {
                return 'error'
            }
            this.teams.remove(this.currentTeam)
            // this.currentTeam.removeMember(this) // this also needs done
        }
        this.teams.push(team)
        this.currentTeam = team
        // team.addMember(this) // also call team.addMember on this user here? leave that to the controller.
    }
}

userSchema.methods.addResult = function (result) {
    this.results.push(result)
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }