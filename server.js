const path = require('path')
const request = require('request')
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

    app.get('/slack', (req, res, next) => {
        let data = {form: {
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET
        }}
        request.post('https://slack.com/api/oauth.access', data, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                let token = JSON.parse(body).access_token
                request.post('https://slack.com/api/team.info', {form: {token}}, (err, res, body) => {
                    let lyric = JSON.parse(body).team.domain
                    res.redirect('Drizzy has been added to your channel')
                })
            }
        })
    })
let randomDrake = () => Lyric[Math.floor((Lyric.length) * (Math.random()))].line

const drakeLyricsToGo = (lyrics, res) => {
    if (lyrics.token !== process.env.SLACK_VERIFICATION_TOKEN) {
        return
    }
    let lyric = randomDrake()
    let data = {
        response_type: 'in_channel',
        text: lyric
    }
    res.json(data)
}
    //Routes
    app.get('/', (req, res, next) => {
        drakeLyricsToGo(req.body, res)
    })

    app.post('/', (req, res, next) => {
        drakeLyricsToGo(req.body, res)
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

