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
        
        next()
    } catch (error) { 
        // here I used to have this:
        // catch (error) { return Err.make(error) }
        
        // but I wasn't sure if a return was syntactically viable for middleware, so my next try was going to be this...
        // catch (error) { 
        //    req.error = error
        //    next()\
        // }
        
        // and then in the next handler I would throw and catch and return the error
    }
}
