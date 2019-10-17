const express = require('express')
const bodyParser = require('body-parser')
const methods = require('./methods/methods')

main = () => {
  const app = express()
  app.use(bodyParser.json({ limit: '15mb' }))
  app.use(bodyParser.urlencoded({ extended: true }))

  methods.start()

  app.post('/get-newbyid', (req, res) => {
    methods.getNewById(req, res)
  })

  app.set('port', process.env.PORT || 4000)
  app.listen(app.get('port'), () => {
    console.log('Server started on ' + app.get('port') + ' port in mode: ' + process.env.NODE_ENV)
  })
}

main()