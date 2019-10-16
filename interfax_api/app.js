const express = require('express')
const bodyParser = require('body-parser')
const methods = require('./methods/methods')

// app.get('/get-products', (req, res) => {
//   Axios.post(url, xmlProducts, {
//     headers: {
//       'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetProductsList"',
//       'Cookie': authCookie
//     }
//   })
//   .then(response => {
//     res.json({
//       products: response.data
//     })
//   })
//   .catch(err => {
//     console.log('Error getting Product List')
//     res.sendStatus(401)
//   })
// })

// app.post('/get-news-by-product', (req, res) => {
//   let id = req.body.id
//   Axios.post(url, xmlGetNewsByProduct(id), {
//     headers: {
//       'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetRealtimeNewsByProduct"',
//       'Cookie': authCookie
//     }
//   })
//   .then(response => {
//     parser.parseString(response.data,(err, result) => {
//       let newsList = checkInObject(result, 'c_nwli')
//       if (newsList !== null) {
//         console.log('New news in this chunk')
//         if (Array.isArray(newsList)) {
//           for (let i = 0; i < newsList.length; i++) {
//             storage.pushNewItemTest(newsList[i])
//           }
//         } else {
//           storage.pushNewItemTest(newsList)
//         }
//       } else {
//         console.log('No new news in this chunk')
//       }
//       // updateMarker = checkInObject(result, 'grnmresp').mbnup
//     })
//   })
//   .catch(err => {
//     console.log('err getting newsByProduct')
//   })
// })


// app.post('/get-newbyid', (req, res) => {
//   let id = req.body.newId
//   Axios.post(url, xmlGetNewById(id), {
//     headers: {
//       'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetEntireNewsByID"',
//       'Cookie': authCookie
//     }
//   })
//   .then(response => {
//     parser.parseString(response.data, (err, result) => {
//       let newItem = checkInObject(result, 'mbn')
//       // console.log(newItem)
//       // console.log(typeof(newItem))
//       res.send(newItem)
//     })
//   })
//   .catch(err => {
//     console.log('Error getting news')
//     console.log(err)
//     res.sendStatus(401)
//   })
// })

main = () => {
  const app = express()
  app.use(bodyParser.json({ limit: '15mb' }))
  app.use(bodyParser.urlencoded({ extended: true }))

  methods.start()

  app.set('port', process.env.PORT || 4000)
  app.listen(app.get('port'), () => {
    console.log('Server started on ' + app.get('port') + ' port in mode: ' + process.env.NODE_ENV)
  })
}

main()