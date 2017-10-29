const Err = require('./../config/error')
const Say = require('./../config/message')

const User = require('./../models/user').model
const Race = require('./../models/race').model
const Team = require('./../models/team').model
const Result = require('./../models/result').model

// no saving in this class to prevent persisting data before errors are thrown

function sanitize (object, type) {
    let sanitized = {}
    
    switch (type) {
        case 'user':
            break
        case 'race':
            break
        case 'team':
            break
        case 'result':
            break
    }
    
    return sanitized
}

module.exports = sanitize
