const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Race = './Race'
const Team = './Team'
const User = './User'

const resultSchema = new Schema({
    id: Number, // does this need to be explicitly named or is it auto-generated?
    race: Race.schema,
    team: Team.schema,
    runner: User.schema,
    time: Number,
    place: Number // auto-calculate this at time of creation?
})

const resultModel = mongoose.model('Result', resultSchema)

module.exports = { schema: resultSchema, model: resultModel }