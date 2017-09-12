const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './race'
const Team = './team'
const User = './user'

const resultSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    race: Race.schema,
    team: Team.schema,
    runner: User.schema,
    time: Number,
    place: Number // auto-calculate this at time of creation?
})

resultSchema.pre('save', function(next) {
    const currentDate = new Date()
    this.updatedAt = currentDate
    if (!this.createdAt)
        this.createdAt = currentDate
    next();
})

const resultModel = mongoose.model('Result', resultSchema)

module.exports = { schema: resultSchema, model: resultModel }