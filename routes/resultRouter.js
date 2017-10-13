const router = require('express').Router()
const ResultController = require('./../controllers/resultController')
const resultController = new ResultController()

router.get('/', async (req, res) => {
    let data = await resultController.index(req)
    res.status(data.code).json(data)
})

router.post('/create', async (req, res) => {
    let data = await resultController.create(req)
    res.status(data.code).json(data)
})

router.route('/:id')
    .get(async (req, res) => {
        let data = await resultController.show(req)
        res.status(data.code).json(data)
    })

    .put(async (req, res) => {
        let data = await resultController.update(req)
        res.status(data.code).json(data)
    })

    .delete(async (req, res) => {
        let data = await resultController.destroy(req)
        res.status(data.code).json(data)
    })

module.exports = router