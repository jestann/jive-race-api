const router = require('express').Router()
const AuthTestController = require('./../controllers/authTestController')
const authTestController = new AuthTestController()

// to authorize presence of visual elements

router.get('/:model/:action', async (req, res) => {
    let data = await authTestController.getAuth(req)
    res.status(data.code).json(data)
})

module.exports = router