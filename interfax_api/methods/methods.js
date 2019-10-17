const Axios = require('axios')
const templates = require('../xml_templates/templates')
let config = require('../config.json')
const parseXml = require('xml2js')
const storage = require('../storage/storage')
const fs = require('fs')

const url = 'http://services.ifx.ru/IFXService.svc'
let authCookie = null
let parser = new parseXml.Parser({ explicitArray: false, ignoreAttrs: true })

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

module.exports = {
  auth () {
    return new Promise((resolve, reject) => {
      Axios.post(url, templates.xmlLogin, {
        headers: {
          'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/OpenSession"'
        }
      })
      .then(response => {
        authCookie = response.headers['set-cookie'].join(';')
        console.log('Authorization success')
        resolve()
      })
      .catch(err => {
        console.log('Some auth error')
        reject()
      })
    })
  },

  getNewsList () {
    Axios.post(url, templates.xmlGetNews(config.updateMarker), {
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetRealtimeNewsByProductWithSelections"',
        'Cookie': authCookie
      }
    })
    .then(response => {
      parser.parseString(response.data,(err, result) => {
        this.newsList = checkInObject(result, 'c_nwli')
        if (this.newsList !== null) {
          if (Array.isArray(this.newsList)) {
            console.log(this.newsList.length + ' new news in this chunk')
            this.getMultipleNews()
          } else {
            let id = this.newsList['i']
            this.getNewItem(id)
          }
        } else {
          console.log('No new news in this chunk')
        }
        config.updateMarker = checkInObject(result, 'grnmresp').mbnup
        fs.writeFileSync('config.json', JSON.stringify(config))
        console.log('Update renew')
        setTimeout(() => {
          this.getNewsList()
        }, 60000)
      })
    })
    .catch(err => {
      console.log(err)
      console.log('Error getting news')
      this.start()
    })
  },

  getNewItem (id) {
    return new Promise((resolve, reject) => {
      Axios.post(url, templates.xmlGetNewById(id), {
        headers: {
          'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetEntireNewsByID"',
          'Cookie': authCookie
        }
      })
      .then(response => {
        parser.parseString(response.data, (err, res) => {
          let newItem = checkInObject(res, 'mbn')
          storage.pushNewItem(newItem)
          resolve(newItem)
        })
      })
      .catch(err => {
        console.log("Error getting new details")
        reject(id)
      })
    })
  },

  getMultipleNews () {
    if (this.newsList.length === 0) {
      return
    }
    let id = this.newsList.shift()['i']
    this.getNewItem(id)
    .then(() => {
      this.getMultipleNews()
    })
    .catch((id) => {
      console.log(`Error getting new id:${id}`)
      this.getMultipleNews()
    })
  },

  start () {
    this.auth()
    .then(() => {
      this.getNewsList()
    })
    .catch(() => {
      console.log('Authorization Failed')
      this.start()
    })
  },

  //----------------REST Requests----------------------------------
  getNewById (req, res) {
    let id = req.body.newId
    console.log(id)
    Axios.post(url, templates.xmlGetNewById(id), {
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8;action="http://ifx.ru/IFX3WebService/IIFXService/GetEntireNewsByID"',
        'Cookie': authCookie
      }
    })
    .then(response => {
      parser.parseString(response.data, (err, result) => {
        let newItem = checkInObject(result, 'mbn')
        res.send(newItem)
      })
    })
    .catch(err => {
      console.log(err)
      console.log("Error getting new details")
      res.sendStatus(404)
    })
  }
}