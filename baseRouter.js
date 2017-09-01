const express = require('express')
const router = express.Router()

// do I need any middleware here?
// passport will be added, also authorization module ?

router.get('/', function (request, response) {
    response.send('Entire list of items.')
})

router.get('/new', function (request, response) {
    response.send('Enter data for new item on this form.')
})

router.post('/new', function (request, response) {
    response.send('Receive data for a new item.')
})

router.get('/:id', function (request, response) {
    response.send('Data about item ', request.params['id'], '.')
})

// do I need a separate path kind of like 'edit' in rails to open a form for entering update data?

router.put('/:id', function (request, response) {
    response.send('Update item ', request.params['id'], '.')
})

router.delete('/:Id', function (request, response) {
    response.send('Delete item ', request.params['id'], '.')
})

module.exports = router