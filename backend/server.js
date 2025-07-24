const fs = require('fs')
const https = require('https')

const express = require('express')
const app = express()
app.use(express.static('public'))
const { port } = require("./config/config");
const key = fs.readFileSync('./config/cert.key');
const cert = fs.readFileSync('./config/cert.crt');
const options = { key, cert }
const httpsServer = https.createServer(options, app);
const socketio = require('socket.io');
const mediasoup = require('mediasoup');

const createWorkers = require("./createWorkers");


const io = socketio(httpsServer, {
    cors: [`https://localhost:${port}`]
})

let workers = null;

const initmediaSoup = async () => {
    workers = await createWorkers();
    console.log(workers);
    
}
initmediaSoup();

httpsServer.listen(port);