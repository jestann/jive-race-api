const express = require('express')
const router = express.Router()

const userController = require('./../controllers/userController')

// passport middleware

router.get('/', (req, res) => {
    res.send(userController.index())
})

router.post('/create', (req, res) => {
    res.send(userController.create(req.body))
})

router.get('/:userId', (req, res) => {
    res.send(userController.show(req.params['userId']))
})

router.put('/:userId', (req, res) => {
    res.send(userController.update(req.params['userId']))
})

router.delete('/:userId', (req, res) => {
    res.send(userController.destroy(req.params['userId']))
})

router.get('/:userId/races', (req, res) => {
    res.send(userController.races(req.params['userId']))
})

router.get('/:userId/teams', (req, res) => {
    res.send(userController.teams(req.params['userId']))
})

module.exports = router


// possibly use
// const newUser = userController.create()
// res.send( newUser ? newUser : 'ERROR' )
