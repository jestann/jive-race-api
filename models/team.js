const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId 

const User = './user'
const Race = './race'
const Result = './result'
const Err = './../config/error'

const teamSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    raceId: { type: ObjectId, required: true },
    name: { type: String, required: true, unique: true },
    description: String,
    slackChannel: String,
    meetingLocation: String,
    ownerId: { type: ObjectId, required: true }, // user id
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
    let added = false
    this.members.forEach((memberId) => {
        if (memberId.toString() === user._id.toString()) { added = true }
    })
    if (!added) { this.members.push(user._id) }
    // also add team to user -- done in memberizer
}

// remove member from team list -- doesn't remove owner
teamSchema.methods.removeMember = function (user) {
    if (this.ownerId.toString() !== user._id.toString()) {
        this.members = this.members.filter((memberId) => memberId.toString() !== user._id.toString() )
    }
    // also remove team from user -- done in memberizer
}

// transfer ownership -- required to remove owner from a team
teamSchema.methods.transfer = function (newOwner) {
    if (newOwner.isOnTeam(this)) { this.ownerId = newOwner._id }
    // retains previous owner as member on team list
    // new owner must be a team member
}


// CALLED FROM RESULT ROUTER

teamSchema.methods.addResult = function (result) {
    let added = false
    this.results.forEach((resultId) => {
        if (resultId.toString() === result._id.toString()) { added = true }
    })
    if (!added) { this.results.push(result._id) }
    // also add team to result -- done in result router
}

teamSchema.methods.removeResult = function (result) {
    this.results = this.results.filter((resultId) => resultId.toString() !== result._id.toString() )
    // also remove team from result -- done in result router
}

const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }