const path = require('path')
const request = require('request')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const PORT = process.env.PORT || 8080
const app = express()
const Lyric = require('./DrakeLyrics.js')
const GphApiClient = require('giphy-js-sdk-core')
const client = GphApiClient(process.env.GIPHY_API_KEY)


app.use(morgan('dev'))
// body parsing middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))


// app.get('/slack', (req, res, next) => {
//     let data = {form: {
//             CLIENT_ID: process.env.SLACK_CLIENT_ID,
//             CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET
//     }}
//     request.post('https://slack.com/api/oauth.access', data, (err, res, body) => {
//         if (!err && res.statusCode === 200) {
//             let token = JSON.parse(body).access_token
//             res.send("ayeee Drizzy has been added to your team")
//             request.post('https://slack.com/api/team.info', {form: {token}}, (err, res, body) => {
//                 let team = JSON.parse(body).team.domain
//                 res.redirect('http://' +team+ '.slack.com')
//             })
//         }
//     })
// })

const randomDrake = () => {
    return Lyric[Math.floor((7242) * (Math.random()))]
}
const getGiphy = () => {

}

const drakeLyricsToGo = (lyrics, res) => {
    // if (lyrics.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    //     return
    // }
    let { line, song_name, artist_name, album } = randomDrake()
    let data = {
        "response_type": "in_channel",
        "text": line,
        "attachments": [
            {"text": `${song_name} - ${album} - ${artist_name}`},
            {"image_url": ""}
        ]
    }
    client.random('gifs', { "tag": "drake", "limit": 1 })
            .then(response => {
                return Promise.all([response.data.images.fixed_height_downsampled.gif_url])
            })
            .then(drake => {
                data.attachments[1].image_url = drake[0]
            })
            .then(() => res.json(data))
            .catch(err => console.error(err))
}
    //Routes
    
app.post('/', (req, res, next) => {
    drakeLyricsToGo(req.body, res)
})

app.get('/', (req, res, next) => {
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


