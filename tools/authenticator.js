const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const Err = require('./../config/error')
const User = require('./../models/User').model

module.exports = (req, res, next) => {
    try { 
        if (!req.headers.token) { throw Err.noToken }
        req.decoded = await jwt.verify(req.headers.token, config.secret)
        req.user = await User.findById(req.decoded.id)
        next()
    } catch (error) { return Err.make(error) }
}
