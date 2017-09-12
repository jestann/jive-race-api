const router = require('express').Router()
const authController = require('./../controllers/authController')

router.post('/', async (req, res) => {
    let data = await authController.authenticate(req)
    res.status(data.code).json(data)
})

module.exports = router