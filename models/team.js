const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const User = './user'
const Race = './race'
const Result = './result'
const Err = './../config/error'

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
    results: [Result.schema]
})

// can't use arrow functions here
teamSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next()
})


// CALLED FROM MEMBERIZER

// add member to team list
teamSchema.methods.addMember = function (user) {
    this.members.push(user)
    // also add team to user -- done in memberizer
}

// remove member from team list -- doesn't remove owner
teamSchema.methods.removeMember = function (user) {
    if (this.owner.id !== user.id) {
        this.members = this.members.filter((member) => { member.id !== user.id })
    }
    // also remove team from user -- done in memberizer
}

// transfer ownership -- required to remove owner from a team
teamSchema.methods.transfer = function (user) {
    this.owner = user 
    // retains previous owner as member on team list
}


// CALLED FROM RESULT ROUTER

teamSchema.methods.addResult = function (result) {
    this.results.push(result)
    // also add team to result -- done in result router
}

teamSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((item) => { item.id !== result.id })
    // also remove team from result -- done in result router
}

const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }