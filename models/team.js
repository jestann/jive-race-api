const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.mongo.ObjectId 

const User = './user'
const Race = './race'
const Result = './result'
const Err = './../config/error'

const teamSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    raceId: ObjectId,
    name: String,
    description: String,
    slackChannel: String,
    meetingLocation: String,
    ownerId: ObjectId, // user id
    members: [ObjectId], // array of user ids
    results: [ObjectId] // array of result ids
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
    this.members.push(user.id)
    // also add team to user -- done in memberizer
}

// remove member from team list -- doesn't remove owner
teamSchema.methods.removeMember = function (user) {
    if (this.ownerId !== user.id) {
        this.members = this.members.filter((memberId) => { memberId !== user.id })
    }
    // also remove team from user -- done in memberizer
}

// transfer ownership -- required to remove owner from a team
teamSchema.methods.transferOwnership = function (newOwner) {
    this.ownerId = newOwner.id
    // retains previous owner as member on team list
    // new owner must be a team member -- per memberizer
}


// CALLED FROM RESULT ROUTER

teamSchema.methods.addResult = function (result) {
    this.results.push(result.id)
    // also add team to result -- done in result router
}

teamSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((resultId) => { resultId !== result.id })
    // also remove team from result -- done in result router
}

const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }