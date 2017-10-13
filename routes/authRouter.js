const router = require('express').Router()
const AuthController = require('./../controllers/authController')
const authController = new AuthController()

router.post('/', async (req, res) => {
    let data = await authController.authenticate(req)
    res.status(data.code).json(data)
})

module.exports = router