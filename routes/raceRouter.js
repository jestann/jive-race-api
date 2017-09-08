const express = require('express')
const router = express.Router()

const raceController = require('./../controllers/raceController')

// passport middleware

router.get('/', (req, res) => {
    res.send(raceController.index())
})

router.post('/create', (req, res) => {
    res.send(raceController.create(/* data */))
})

router.get('/:raceId', (req, res) => {
    res.send(raceController.show(req.params['raceId']))
})

router.put('/:raceId', (req, res) => {
    res.send(raceController.update(req.params['raceId']))
})

router.delete('/:raceId', (req, res) => {
    res.send(raceController.destroy(req.params['raceId']))
})

router.get('/:raceId/teams', (req, res) => {
    res.send(raceController.teams(req.params['raceId']))
})

router.get('/:raceId/users', (req, res) => {
    res.send(raceController.users(req.params['raceId']))
})

module.exports = router