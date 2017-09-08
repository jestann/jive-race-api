const userModule = require('./../models/User')
const User = userModule.model

module.exports = new Class {
    index () {
        try {
            User.find({}, function (err, users) {
                if (err) throw err;
                return users
            })
        } catch (err) { return err }
    }
    // need a th
    
    create (data) {
        try {
            let newUser = new User({
                name: data.name,
                username: data.username,
                password: data.password
            })
            newUser.save(function(err) {
                if (err) throw err;
                return "Saved successfully."
            }
        } catch (err) { return err }
    }
    
}

/* var myModel = mongoose.model('ModelName');

example creation of model instance

let race17 = new Race({year: '2017'})

race17.save(function (error, race17) {
  if (error) return console.error(error)
  race17.getYear()
})

*/