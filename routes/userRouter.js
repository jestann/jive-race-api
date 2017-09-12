const router = require('express').Router()
const userController = require('./../controllers/userController')

router.get('/', async (req, res) => {
    let data = await userController.index(req)
    res.status(data.code).json(data)
})

router.post('/create', async (req, res) => {
    let data = await userController.create(req)
    res.status(data.code).json(data)
})

router.route('/:id')
    .get(async (req, res) => {
        let data = await userController.show(req)
        res.status(data.code).json(data)
    })

    .put(async (req, res) => {
        let data = await userController.update(req)
        res.status(data.code).json(data)
    })

    .delete(async (req, res) => {
        let data = await userController.destroy(req)
        res.status(data.code).json(data)
    })

router.get('/:id/races', async (req, res) => {
    let data = await userController.races(req)
    res.status(data.code).json(data)
})

router.get('/:id/teams', async (req, res) => {
    let data = await userController.teams(req)
    res.status(data.code).json(data)
})

router.get('/:id/results', async (req, res) => {
    let data = await userController.results(req)
    res.status(data.code).json(data)
})

router.post('/:id/register', async (req, res) => {
    let data = await userController.register(req)
    res.status(data.code).json(data)
})

router.post('/:id/jointeam', async (req, res) => {
    let data = await userController.joinTeam(req)
    res.status(data.code).json(data)
})

router.post('/:id/addresult', async (req, res) => {
    let data = await userController.addResult(req)
    res.status(data.code).json(data)
})

module.exports = router