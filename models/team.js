const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './race'
const User = './user'
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
    members: [User.schema],
    results: [Result.schema] // easy querying of results might require additional fields
})

teamSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})


const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }