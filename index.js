const config = require('./config')
const express = require('express')
const app = express()
const port = config.port || 3000

app.get('/', (req, res) => res.send('Hello World!'))
app.use(express.static('public'))
app.use('/temp', express.static('temp'))


app.listen(port, () => console.log(`Example app listening on port ${port}!`))