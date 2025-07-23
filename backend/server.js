const fs = require('fs')
const https = require('https')

const express = require('express')
const app = express()
app.use(express.static('public'))

const key = fs.readFileSync('./config/cert.key');
const cert = fs.readFileSync('./config/cert.crt');
const options = { key, cert }
const httpsServer = https.createServer(options, app);
const socketio = require('socket.io');
const mediasoup = require('mediasoup');

const createServer = require("./createWorkers");


const io = socketio(httpsServer, {
    cors: ['https://localhost:3030']
})


httpsServer.listen(3030);