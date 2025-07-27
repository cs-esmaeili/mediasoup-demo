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
const createWebRtcTransportBothKinds = require('./createWebRtcTransportBothKinds')


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

    let thisClientCounsumerTransport = null;
    let thisClientCounsumer = null;

    socket.on('getRtpCap', ack => {
        ack(router.rtpCapabilities);
    })

    socket.on('create-producer-transport', async ack => {
        //create a transport ; producer  transport

        const { transport, clientTransportParams } = await createWebRtcTransportBothKinds(router);
        thisClientProducerTransport = transport
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


    socket.on('create-consumer-transport', async ack => {
        //create a transport ; consumer  transport

        const { transport, clientTransportParams } = await createWebRtcTransportBothKinds(router);
        thisClientCounsumerTransport = transport;
        ack(clientTransportParams);
    });

    socket.on('connect-consumer-transport', async (dtlsParameters, ack) => {
        //get dtls info from the client , and finish the connection
        try {
            await thisClientCounsumerTransport.connect(dtlsParameters);
            ack("success");
        } catch (error) {
            console.log(error);
            ack("error");
        }
    })

    socket.on('consume-media', async ({ rtpCapabilities }, ack) => {
        if (!thisClientProducer) {
            ack("noProducer");
        } else if (!router.canConsume({ producerId: thisClientProducer.id, rtpCapabilities })) {
            ack("cantConsume");
        } else {
            thisClientCounsumer = await thisClientCounsumerTransport.consume({ producerId: thisClientProducer.id, rtpCapabilities, paused: true })
            const counsumerParams = {
                producerId: thisClientProducer.id,
                id: thisClientCounsumer.id,
                kind: thisClientCounsumer.kind,
                rtpParameters: thisClientCounsumer.rtpParameters
            }
            ack(counsumerParams);
        }
    })

    socket.on('unpauseConsumer', async ( ack) => {
        await thisClientCounsumer.resume();
    })


})
httpsServer.listen(port);