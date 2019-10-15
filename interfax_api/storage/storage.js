const Datastore = require('nedb')

module.exports = {
  news: new Datastore({
    filename: 'storage/news',
    autoload: true
  }),
  testNews: new Datastore({
    filename: 'storage/testNews',
    autoload: true
  }),

  pushNewItem (raw) {
    let newItem = {
      id: raw.i,
      published: raw.pd,
      title: raw.h
    }
    this.news.insert(newItem, (err, record) => {
      if (err) {
        return console.log(err)
      }
      console.log('ok')
    })
  },
  pushNewItemTest (raw) {
    let newItem = {
      id: raw.i,
      published: raw.pd,
      title: raw.h
    }
    this.testNews.insert(newItem, (err, record) => {
      if (err) {
        return console.log(err)
      }
      console.log('ok')
    })
  }
}