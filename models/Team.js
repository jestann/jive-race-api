const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './Race'
const User = './User'
const Result = './Result'

const teamSchema = new Schema({
    id: Number, // does this need to be explicitly named or is it auto-generated?
    race: Race.schema,
    name: String,
    description: String,
    slackChannel: String,
    meetingLocation: String,
    owner: User.schema,
    members: [User.schema],
    results: [Result.schema] // easy querying of results might require additional fields
})

const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }