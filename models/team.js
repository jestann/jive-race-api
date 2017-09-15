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
    members: [User.schema]
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

// cannot use on owner
teamSchema.methods.removeMember = function (user) {
    this.members = this.members.filter((member) => { member.id !== user.id })
}

teamSchema.methods.transfer = function (user) {
    this.owner = user // retains previous owner as team member
}

const teamModel = mongoose.model('Team', teamSchema)

module.exports = { schema: teamSchema, model: teamModel }