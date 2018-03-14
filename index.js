const path = require('path')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compression = require('compression')
const PORT = process.env.PORT || 8080
const app = express()
const Lyric = require('./DrakeLyrics.js')


module.exports = app

/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */
//if (process.env.NODE_ENV !== 'production') require('../secrets')

    // logging middleware
    app.use(morgan('dev'))

    // body parsing middleware
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    // compression middleware
    app.use(compression())

    //Routes
    app.get('/', (req, res, next) => {
        res.send(Lyric[Math.floor((Lyric.length) * (Math.random()))].line)
    })

    // any remaining requests with an extension (.js, .css, etc.) send 404
    app.use((req, res, next) => {
        if (path.extname(req.path).length) {
            const err = new Error('Not found')
            err.status = 404
            next(err)
        } else {
            next()
        }
    })
    // error handling endware
    app.use((err, req, res, next) => {
        console.error(err)
        console.error(err.stack)
        res.status(err.status || 500).send(err.message || 'Internal server error.')
    })

app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))

