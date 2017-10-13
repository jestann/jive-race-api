const router = require('express').Router()
const RaceController = require('./../controllers/raceController')
const raceController = new RaceController()

router.get('/', async (req, res) => {
    let data = await raceController.index(req)
    res.status(data.code).json(data)
})

router.post('/create', async (req, res) => {
    let data = await raceController.create(req)
    res.status(data.code).json(data)
})

router.route('/:id')
    .get(async (req, res) => {
        let data = await raceController.show(req)
        res.status(data.code).json(data)
    })
    
    .put(async (req, res) => {
        let data = await raceController.update(req)
        res.status(data.code).json(data)
    })

    .delete(async (req, res) => {
        let data = await raceController.destroy(req)
        res.status(data.code).json(data)
    })

router.get('/:id/runners', async (req, res) => {
    let data = await raceController.runners(req)
    res.status(data.code).json(data)
})

router.get('/:id/teams', async (req, res) => {
    let data = await raceController.teams(req)
    res.status(data.code).json(data)
})

router.get('/:id/results', async (req, res) => {
    let data = await raceController.results(req)
    res.status(data.code).json(data)
})

router.put('/:id/open', async (req, res) => {
    let data = await raceController.open(req)
    res.status(data.code).json(data)
})

router.put('/:id/archive', async (req, res) => {
    let data = await raceController.archive(req)
    res.status(data.code).json(data)
})

router.put('/:id/setcoordinator', async (req, res) => {
    let data = await raceController.setCoordinator(req)
    res.status(data.code).json(data)
})

// teams, runners, and results are added to a race through the corresponding user, team, and result routes

module.exports = router