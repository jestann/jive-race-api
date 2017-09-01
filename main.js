const express = require('express')
const app = express()


// routing
const baseRouter = require('./baseRouter')

app.get('/', function (request, response) {
    response.send('Welcome.')
})

app.get('/about', function (request, response) {
    response.send('About.')
})

app.use('/races', baseRouter)
app.get('/races/:raceId/teams', function (request, response) { 
    // authenticate with passport
    // authorize for data
    // return either { success, data } or { false, error message }
    response.send('All teams for race ', request.params['raceId'], '.')
})

app.use('/teams', baseRouter)
app.get('/teams/:teamId/users', function (request, response) {
    response.send('All users for team ', request.params['teamId'], '.')
})

app.use('/users', baseRouter)


/*
// mongoose setup

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // callback
});


// mongoose schema example

const raceSchema = mongoose.Schema({
    year: String
})

raceSchema.methods.getYear = function () {
  let message = this.year
    ? "This race is for the year " + this.year + "."
    : "No listed year."
  console.log(message)
}

const Race = mongoose.model('Race', raceSchema)


// test race model instance

let race17 = new Race({year: '2017'})

race17.save(function (error, race17) {
  if (error) return console.error(error)
  race17.getYear()
})
*/



// server
app.listen(3000, function () {
  console.log('App listening on port 3000.')
})



/*

PROJECT.

1. routes
2. database schema
3. passport authentication
4. authorization model
5. front end

express backend.
app.get(
- authenticate
- passport.user authorize against data
- if authorized, get data from mongoose
- return (success, json object) 
- OR (failure, error message)
)

write authorize model.
takes in user, which database data, that's it.
user can access team? function name.
easy to check, because...
returns true or false.

on front end, view
- front end looks to back end for data.
- "need teams here at this route"
- returns json object or error
- if returns error, redirect or display
- if returns object, populate the view

QUESTIONS.
how to pass data in not just out?
request.params, or from path?

*/