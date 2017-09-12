const router = require('express').Router()
const teamController = require('./../controllers/teamController')

router.get('/', async (req, res) => {
    let data = await teamController.index(req)
    res.status(data.code).json(data)
})

router.post('/create', async (req, res) => {
    let data = await teamController.create(req)
    res.status(data.code).json(data)
})

router.route('/:id')
    .get(async (req, res) => {
        let data = await teamController.show(req)
        res.status(data.code).json(data)
    })

    .put(async (req, res) => {
        let data = await teamController.update(req)
        res.status(data.code).json(data)
    })

    .delete(async (req, res) => {
        let data = await teamController.destroy(req)
        res.status(data.code).json(data)
    })

router.get('/:id/results', async (req, res) => {
    let data = await teamController.results(req)
    res.status(data.code).json(data)
})

module.exports = router