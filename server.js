const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()
const connectionStr = process.env.DB_STRING

MongoClient.connect(connectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to Database`)
        
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')

        app.set('view engine', 'ejs')
       
        app.use(bodyParser.urlencoded({ extended: true }))

        app.use(express.static('public'))

        app.use(bodyParser.json())
        
        app.get('/', (req, res) => {
            quotesCollection.find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results })
                })
                .catch(error => console.error(error))
        })        
        
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })
        
        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                {name: 'Yoda'},
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
            .then(result => {
                res.json('Success')
            })
            .catch(error => console.error(error))
        })

        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
            {name: req.body.name}
            )
            .then(result => {
                if (result.deletedCount === 0) {
                    return res.json('No quote to delete')
                  }
                res.json("Deleted Darth Vader's quote")
            })
            .catch(error => console.error(error))
          })

        app.listen(process.env.PORT || PORT, () => {
            console.log(`The server is running on port ${PORT}!`)
        })
    })
    .catch(error => console.error(error))