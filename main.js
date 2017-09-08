const express = require('express')
const app = express()


// Require routes.

app.get('/', function (request, response) {
    response.send('Welcome.')
})

app.get('/about', function (request, response) {
    response.send('About.')
})

const raceRouter = require('./raceRouter')
app.use('/races', raceRouter)

const teamRouter = require('./teamRouter')
app.use('/teams', teamRouter)

const userRouter = require('./userRouter')
app.use('/users', userRouter)



// Set up mongoose.

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test'); // what should this be?

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // callback
});



// Set up server.

app.listen(process.env.PORT, function () {
  console.log('App listening on port ', process.env.PORT)
})



/*

PROJECT NOTES.

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