const express = require('express')
const bodyParser = require('body-parser')
const exec = require('child_process').exec

const hostname = '127.0.0.1'
const port = 3015

const app = express()
 
app.use(bodyParser.urlencoded({ extended: false }))
 
app.post('/', function (req, res) {
  console.log('Got Webhook update from: ', JSON.parse(req.body.payload).repository.full_name)
  res.set('Content-Type', 'text/plain')
  res.send(`Thanks`)
  exec('./update.sh', (error, stdout, stderr) => {
    if (error) console.log(error)
    console.log(stdout)
  })
})
 
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
