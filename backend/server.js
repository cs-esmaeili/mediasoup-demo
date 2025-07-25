const fs = require('fs')
const https = require('https')

const express = require('express')
const app = express()
app.use(express.static('public'))
const { port, routerMediaCodex } = require("./config/config");
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

//globals
let workers = null;
let router = null;


const initmediaSoup = async () => {
    workers = await createWorkers();

    router = await workers[0].createRouter({ mediaCodecs: routerMediaCodex })
}
initmediaSoup();


//socketio  listerners
io.on('connect', (socket) => {

    let thisClientProducerTransport = null;
    let thisClientProducer = null;

    socket.on('getRtpCap', ack => {
        ack(router.rtpCapabilities);
    })

    socket.on('create-producer-transport', async ack => {
        //create a transport ; producer  transport

        thisClientProducerTransport = await router.createWebRtcTransport({
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            listenInfos: [
                {
                    protocol: 'udp',
                    ip: '127.0.0.1'
                },
                {
                    protocol: 'tcp',
                    ip: '127.0.0.1'
                }
            ]
        });

        const { id, iceParameters, iceCandidates, dtlsParameters } = thisClientProducerTransport
        const clientTransportParams = {
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
        }
        ack(clientTransportParams);
    });

    socket.on('connect-transport', async (dtlsParameters, ack) => {
        //get dtls info from the client , and finish the connection
        try {
            await thisClientProducerTransport.connect(dtlsParameters);
            ack("success");
        } catch (error) {
            console.log(error);
            ack("error");
        }
    })

    socket.on('start-producing', async ({ kind, rtpParameters }, ack) => {
        //get dtls info from the client , and finish the connection
        try {
            thisClientProducer = await thisClientProducerTransport.produce({ kind, rtpParameters });
            ack(thisClientProducer.id);
        } catch (error) {
            console.log(error);
            ack("error");
        }
    })


})
httpsServer.listen(port);