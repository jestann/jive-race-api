const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './Race'
const Team = './Team'
const Result = './Result'

const userSchema = new Schema({
    id: Number, // does this need to be explicitly named or is it auto-generated?
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean,
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
    email: String,
    slackName: String,
    races: [Race.schema], // to see if registered for current race, query for current race ID ... is that hard? should I have a "current" boolean instead?
    dateLastRegistered: Date,
    teams: [Team.schema],
    currentTeam: Team.schema, // to avoid having to query allTeams for current race, should I specify a default?
    results: [Result.schema]
})

userSchema.virtual('fullName').get(function() { 
    return this.firstName + ' ' + this.lastName 
})

userSchema.virtual('age').get(function() {
    return Date.now - this.birthdate
})
// debug this code to get it correct

// on JSON.stringify pass {virtuals: true}

const userModel = mongoose.model('User', userSchema)

module.exports = { schema: userSchema, model: userModel }