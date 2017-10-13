const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const Err = require('./../config/error')
const Say = require('./../config/message')
const User = require('./../models/user').model

class AuthController {
    async authenticate (req) {
        try {
            let currentUser = await User.findOne({ username: req.body.username })
            if (!currentUser) { throw Err.userNotFound }

            if (await bcrypt.compare(req.body.password, currentUser.password)) { throw Err.wrongPassword }
            
            let token = await jwt.sign({ id: currentUser.id }, config.secret, { expiresIn: '2h' })
            if (!token) { throw Err.authError }
            
            return Say.success('token', token)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = AuthController