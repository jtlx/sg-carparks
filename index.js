const config = require('./config')
const express = require('express')
const app = express()
const port = config.port || 3000

app.get('/', (req, res) => res.sendFile(__dirname + '/public/map.html'))
app.use(express.static('public'))
app.use('/temp', express.static('temp'))

app.listen(port, () => console.log(`App listening on port ${port}!`))