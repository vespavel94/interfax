const express = require('express')
const bodyParser = require('body-parser')
const Axios = require('axios')
const fs = require('fs')
const parseXml = require('xml2js')
const storage = require('./storage/storage')

let parser = new parseXml.Parser({ explicitArray: false })

const app = express()
app.use(bodyParser.json({ limit: '15mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

const url = 'http://services.ifx.ru/IFXService.svc'
let authCookie = null
let updateMarker = ''

const xmlLogin = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService">
<soap:Header/>
<soap:Body>
   <ifx:osmreq>
      <ifx:mbci>client1</ifx:mbci>
      <ifx:mbcv>1.0</ifx:mbcv>
      <ifx:mbh>OnlyHeadline</ifx:mbh>
      <ifx:mbl>k.khodov@solidbroker.ru</ifx:mbl>
      <ifx:mbla>ru-RU</ifx:mbla>
      <ifx:mbo>Windows</ifx:mbo>
      <ifx:mbp>iwHPnpZ</ifx:mbp>
      <ifx:mbt></ifx:mbt>
   </ifx:osmreq>
</soap:Body>
</soap:Envelope>
`
const xmlProducts = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body/>
</soap:Envelope>`

xmlGetNews = () => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
  <soap:Header/>
  <soap:Body>
     <ifx:grnbpsmreq>
        <ifx:direction>0</ifx:direction>
        <ifx:mbcid></ifx:mbcid>
        <ifx:mblnl>100</ifx:mblnl>
        <ifx:mbsup>${updateMarker}</ifx:mbsup>
        <ifx:sls>
           <arr:string>?</arr:string>
        </ifx:sls>
     </ifx:grnbpsmreq>
  </soap:Body>
  </soap:Envelope>`
}

const xmlGetRubrics = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body/>
  </soap:Envelope>`

xmlGetNewById = (id) => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService">
  <soap:Header/>
  <soap:Body>
     <ifx:genmreq>
        <ifx:mbnid>${id}</ifx:mbnid>
     </ifx:genmreq>
  </soap:Body>
  </soap:Envelope>`
}

xmlGetNewsByProduct = (id) => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService">
  <soap:Header/>
  <soap:Body>
     <ifx:grnbpmreq>
        <ifx:direction>0</ifx:direction>
        <ifx:mbcid>${id}</ifx:mbcid>
        <ifx:mblnl>100</ifx:mblnl>
        <ifx:mbsup></ifx:mbsup>
     </ifx:grnbpmreq>
  </soap:Body>
</soap:Envelope>`
}

xmlGetNewsByRTS = (id) => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService">
  <soap:Header/>
  <soap:Body>
     <ifx:grnbpmreq>
        <ifx:direction>0</ifx:direction>
        <ifx:mbcid>${id}</ifx:mbcid>
        <ifx:mblnl>100</ifx:mblnl>
        <ifx:mbsup></ifx:mbsup>
     </ifx:grnbpmreq>
  </soap:Body>
</soap:Envelope>`
}

app.get('/get-products', (req, res) => {
  Axios.post(url, xmlProducts, {
    headers: {
      'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetProductsList"',
      'Cookie': authCookie
    }
  })
  .then(response => {
    res.json({
      products: response.data
    })
  })
  .catch(err => {
    console.log('Error getting Product List')
    res.sendStatus(401)
  })
})

app.post('/get-news-by-product', (req, res) => {
  let id = req.body.id
  Axios.post(url, xmlGetNewsByProduct(id), {
    headers: {
      'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetRealtimeNewsByProduct"',
      'Cookie': authCookie
    }
  })
  .then(response => {
    parser.parseString(response.data,(err, result) => {
      let newsList = checkInObject(result, 'c_nwli')
      if (newsList !== null) {
        console.log('New news in this chunk')
        if (Array.isArray(newsList)) {
          for (let i = 0; i < newsList.length; i++) {
            storage.pushNewItemTest(newsList[i])
          }
        } else {
          storage.pushNewItemTest(newsList)
        }
      } else {
        console.log('No new news in this chunk')
      }
      // updateMarker = checkInObject(result, 'grnmresp').mbnup
    })
  })
  .catch(err => {
    console.log('err getting newsByProduct')
  })
})


app.post('/get-newbyid', (req, res) => {
  let id = req.body.newId
  Axios.post(url, xmlGetNewById(id), {
    headers: {
      'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetEntireNewsByID"',
      'Cookie': authCookie
    }
  })
  .then(response => {
    res.json(response.data)
  })
  .catch(err => {
    console.log('Error getting news')
    console.log(err)
    res.sendStatus(401)
  })
})

//----------------------------------functions---------------------------------------------

const auth = () => {
  return new Promise((resolve, reject) => {
    Axios.post(url, xmlLogin, {
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/OpenSession"'
      }
    })
    .then(response => {
      authCookie = response.headers['set-cookie'].join(';')
      resolve()
    })
    .catch(err => {
      console.log('Some auth error')
      reject()
    })
  })
}

const getNewsList = () => {
  Axios.post(url, xmlGetNews(), {
    headers: {
      'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetRealtimeNewsByProductWithSelections"',
      'Cookie': authCookie
    }
  })
  .then(response => {
    parser.parseString(response.data,(err, result) => {
      let newsList = checkInObject(result, 'c_nwli')
      if (newsList !== null) {
        console.log('New news in this chunk')
        if (Array.isArray(newsList)) {
          for (let i = 0; i < newsList.length; i++) {
            storage.pushNewItem(newsList[i])
          }
        } else {
          storage.pushNewItem(newsList)
        }
      } else {
        console.log('No new news in this chunk')
      }
      updateMarker = checkInObject(result, 'grnmresp').mbnup
      setTimeout(() => {
        getNewsList(updateMarker)
      }, 30000)
    })
  })
  .catch(err => {
    console.log('Error getting news')
    console.log(err)
    auth()
    .then(() => {
      getNewsList()
    })
  })
}

function checkInObject(obj, name) {
  let res = null
  for ( let i in obj ) {
    if(obj.hasOwnProperty(i)) {
      if (i === name) {
        res = obj[i]
        break
      }
      if (obj[i] && obj[i].constructor === Object) {
        let check = checkInObject(obj[i], name)
        if (check) {
          res = check
          break
        }
      }
    }
  }
  return res
}

auth()
.then(() => {
  getNewsList()
})


const server = app.listen('4000', () => {
  console.log('Server started on 3000 port')
})