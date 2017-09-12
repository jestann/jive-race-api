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
    role: { type: String, default: 'member' },
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
    current: Boolean, // registered for current race
    dateRegistered: Date,
    teams: [Team.schema],
    currentTeam: Team.schema,
    results: [Result.schema]
})

userSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

userSchema.methods.isMember = function () {
    if (this.role === 'member' || this.role === 'admin') { return true }
    return false
}

userSchema.methods.isAdmin = function () {
    if (this.role === 'admin') { return true }
    return false
}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }