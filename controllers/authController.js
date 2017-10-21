const Err = require('./../config/error')
const Say = require('./../config/message')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const User = require('./../models/user').model

class AuthController {
    async register (req) {
        try {
            // create a new user and save
            if (!req.body.email || !req.body.username || !req.body.password) { throw Err.missingData }
            let passwordHash = await bcrypt.hash(req.body.password, 10)
            let newUser = new User({
                email: req.body.email,
                username: req.body.username,
                password: passwordHash,
                role: 'member'
            })
            await newUser.save() // handles validation and save errors terribly

            // get a token for the new user
            let token = await jwt.sign({ id: newUser._id.toString() }, config.secret, { expiresIn: '1h' })
            if (!token) { throw Err.authError }
            
            return Say.success('token', token, Say.registered)
            
        } catch (error) { return Err.make(error) }
    }

    async logIn (req) {
        try {
            // log in the user and check
            let currentUser = await User.findOne({ username: req.body.username })
            if (!currentUser) { throw Err.userNotFound }

            let passwordTest = await bcrypt.compare(req.body.password, currentUser.password)
            if (!passwordTest) { throw Err.wrongPassword }
            
            // get a token for the user
            let token = await jwt.sign({ id: currentUser._id.toString() }, config.secret, { expiresIn: '1h' })
            if (!token) { throw Err.authError }
            
            return Say.success('token', token, Say.loggedIn)
            
        } catch (error) { return Err.make(error) }
    }
    
    async logOut (req) {
        try {
            // log out the user and check
            // let token = req.token
            // token.expire()
            
            throw Err.underConstruction // this route not yet working
            return Say.success(Say.loggedOut)
            
        } catch (error) { return Err.make(error) }
    }
}

module.exports = AuthController