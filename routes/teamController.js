const express = require('express')
const router = express.Router()

const teamController = require('./../controllers/teamController')

// passport middleware

router.get('/', (req, res) => {
    res.send(teamController.index())
})

router.post('/create', (req, res) => {
    res.send(teamController.create(/* data */))
})

router.get('/:teamId', (req, res) => {
    res.send(teamController.show(req.params['teamId']))
})

router.put('/:teamId', (req, res) => {
    res.send(teamController.update(req.params['teamId']))
})

router.delete('/:teamId', (req, res) => {
    res.send(teamController.destroy(req.params['teamId']))
})

router.get('/:teamId/members', (req, res) => {
    res.send(teamController.members(req.params['teamId']))
})

module.exports = router