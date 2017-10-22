const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const Err = require('./../config/error')
const User = require('./../models/user').model

module.exports = async (req, res, next) => {
    try { 
        if (!req.headers.token) { throw Err.noToken }

        let decoded = await jwt.verify(req.headers.token, config.secret)
        if (!decoded) { throw Err.authError }
        req.decoded = decoded
        
        let user = await User.findById(req.decoded.id)
        if (!user) { throw Err.userNotFound }
        req.user = user
        
        return next()
    } catch (error) { 
        let data = Err.make(error)
        res.status(data.code).json(data)
    }
}
