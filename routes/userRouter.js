const router = require('express').Router()
const UserController = require('./../controllers/userController')
const userController = new UserController()

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

router.put('/:id/register', async (req, res) => {
    let data = await userController.register(req)
    res.status(data.code).json(data)
})

router.put('/:id/unregister', async (req, res) => {
    let data = await userController.unregister(req)
    res.status(data.code).json(data)
})

router.put('/:id/jointeam', async (req, res) => {
    let data = await userController.joinTeam(req)
    res.status(data.code).json(data)
})

router.put('/:id/leaveteam', async (req, res) => {
    let data = await userController.leaveTeam(req)
    res.status(data.code).json(data)
})

router.put('/:id/makeadmin', async (req, res) => {
    let data = await userController.makeAdmin(req)
    res.status(data.code).json(data)
})

router.put('/:id/makemember', async (req, res) => {
    let data = await userController.makeMember(req)
    res.status(data.code).json(data)
})

router.post('/seed', async (req, res) => {
    let data = await userController.seed(req)
    res.status(data.code).json(data)
})

// results are added through corresponsing result route

module.exports = router