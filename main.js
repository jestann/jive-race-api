// Set up dependencies.

const app = require('express')()
const config = require('./config/config')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const morgan = require('morgan')
app.use(morgan('dev'))


// Set up database.

const mongoose = require('mongoose')
mongoose.connect(config.database)


// Set up middleware for development.

// for dealing with cors
app.use('/', async (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  // res.header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  res.header('Access-Control-Max-Age', 1728000)
  return next()
})

// for dealing with preflight options requests
const proxy = require('http-proxy-middleware')
let options = {
  target: 'http://race-front-end-jessann.c9users.io/',
  changeOrigin: true,
  ws: true,
  /*
  pathRewrite: {
    '^/api/old-path' : '/api/new-path', // rewrite path
    '^/api/remove/path' : '/path'       // remove base path
  },
  router: {
    // when request.headers.host == 'dev.localhost:3000',
    // override target 'http://www.example.org' to 'http://localhost:8000'
    'dev.localhost:3000' : 'http://localhost:8000'
  },
  */
  logLevel: 'debug',
  onError: function onError(err, req, res) {
  console.log('Something went wrong with the proxy middleware.', err)
  res.end()
  }
}
app.use('/', proxy(options))


// Set up routes.

// unprotected routes
app.get('/test', async (req, res) => { res.send('Test.') })

// register or login to retrieve a token
const authRouter = require('./routes/authRouter')
app.use('/auth', authRouter)

// for authorizing presence of visual elements
// how should this be authenticated?
const authTestRouter = require('./routes/authTestRouter')
app.use('/authtest', authTestRouter)


// authentication middleware
const authenticator = require('./tools/authenticator')
app.use('/api', authenticator)

// protected routes
const userRouter = require('./routes/userRouter')
app.use('/api/users', userRouter)

const raceRouter = require('./routes/raceRouter')
app.use('/api/races', raceRouter)

const teamRouter = require('./routes/teamRouter')
app.use('/api/teams', teamRouter)

const resultRouter = require('./routes/resultRouter')
app.use('/api/results', resultRouter)


// Set up server.

app.listen(process.env.PORT, function () {
  console.log('Listening on port ', process.env.PORT, '....')
})
