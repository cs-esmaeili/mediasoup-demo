const http = require('http')

const express = require('express')
const app = express()
app.use(express.static('public'))
const { port, routerMediaCodex } = require("./config/config");
const httpServer = http.createServer(app);
const socketio = require('socket.io');
const mediasoup = require('mediasoup');
const Client = require('./classes/Client');
const Room = require('./classes/Room');

const createWorkers = require("./createWorkers");


const io = socketio(httpServer, {
    cors: [`http://localhost:5173`]
})

//globals
let workers = null;
let router = null;

const initmediaSoup = async () => {
    workers = await createWorkers();

    router = await workers[0].createRouter({ mediaCodecs: routerMediaCodex })
}
initmediaSoup();

io.on('connect', (socket) => {

    let client;
    const handshake = socket.handshake;

    socket.on('joinRoom', ({ userName, roomName }) => {
        client = new Client({ userName, socket, router });
    })

})
httpServer.listen(port);