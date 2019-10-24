const Datastore = require('nedb')

module.exports = {
  news: new Datastore({
    filename: 'storage/news',
    autoload: true
  }),

  pushNewItem (raw) {
    let newItem = {
      id: raw.i,
      published: raw.pd,
      title: raw.h,
      body: raw.c,
      summary: raw.c.substr(0, 50),
      priority: raw.sp ? raw.sp : null,
      tickers: raw.rt ? (Array.isArray(raw.rt['a:string']) ? raw.rt['a:string'] : raw.rt['a:string'].split(',')) : null,
      rubrics: raw.r ? raw.r['a:string'] : null,
      geo: raw.g ? raw.g['a:string'] : null
    }
    if (newItem.body.indexOf('Банк России') !== -1 || newItem.body.indexOf('ОФЗ') !== -1) {
      Array.isArray(newItem.tickers) ? newItem.tickers.push('BOND') : newItem.tickers = ['BOND']
    }
    this.news.insert(newItem, (err, record) => {
      if (err) {
        return console.log(err)
      }
      console.log(`Pushed item ${record.id}`)
    })
  },

  getNewItem (key, value) {
    return new Promise((resolve, reject) => {
      this.news.find({ [key]: value }).sort({ published: -1 }).exec((err, records) => {
        if (err) {
          reject()
        } else {
          resolve(records)
        }
      })
    })
  }
}