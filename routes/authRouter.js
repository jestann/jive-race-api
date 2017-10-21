const router = require('express').Router()
const AuthController = require('./../controllers/authController')
const authController = new AuthController()

router.post('/register', async (req, res) => {
    let data = await authController.register(req)
    res.status(data.code).json(data)
})

router.put('/login', async (req, res) => {
    let data = await authController.logIn(req)
    res.status(data.code).json(data)
})

router.put('/logout', async (req, res) => {
    let data = await authController.logOut(req)
    res.status(data.code).json(data)
})

module.exports = router