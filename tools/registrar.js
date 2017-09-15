const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/User').model
const User = require('./../models/Race').model
const User = require('./../models/Team').model
const User = require('./../models/Result').model

module.exports = {
    register:   function (user, race) {
        
    }
        
    }
    
    try { 
        if (!req.headers.token) { throw Err.noToken }
        req.decoded = await jwt.verify(req.headers.token, config.secret)
        req.user = await User.findById(req.decoded.id)
        next()
    } catch (error) { return Err.make(error) }
    
    unregister {
        
    }
}
