const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const User = './user'
const Race = './race'
const Result = './result'

const teamSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    race: Race.schema,
    name: String,
    description: String,
    slackChannel: String,
    meetingLocation: String,
    owner: User.schema,
    members: [User.schema], // this will include the owner
    results: [Result.schema] // easy querying of results might require additional fields
})

// can't use arrow functions here
teamSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})

teamSchema.methods.addMember = function (user) {
    this.members.push(user)
}

teamSchema.methods.removeMember = function (user) {
    this.members.remove(user) // this is problematic if it's the owner? prompt to transfer?
}

teamSchema.methods.addResult = function (result) {
    this.results.push(result)
}

teamSchema.methods.transfer = function (user) {
    this.owner = user
}

const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }