let socket = null;
let device = null;
let localStream = null;
let producerTransport = null;
let producer = null;
let cunsumerTransport = null;
let consumer = null;

const initConnect = () => {

    socket = io('https://192.168.1.2:3030');
    connectButton.innerHTML = "connecting ...";
    connectButton.disabled = true;
    addScoketListeners();
}
const deviceSetup = async () => {
    // console.log(mediasoupClient);

    device = new mediasoupClient.Device();

    const routerRtpCapabilities = await socket.emitWithAck('getRtpCap');

    await device.load({ routerRtpCapabilities })

    deviceButton.disabled = true;
    createProdButton.disabled = false;
    createConsButton.disabled = false;
    disconnectButton.disabled = false;
}

const createProducer = async () => {

    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        // localStream = await navigator.mediaDevices.getDisplayMedia({
        //     video: true,
        //     audio: true,
        // });

        localVideo.srcObject = localStream;
    } catch (error) {
        console.log("GUM  ERROR = " + error);
    }

    // asdk the socket.io server for transport information
    const data = await socket.emitWithAck('create-producer-transport');
    const { id, iceParameters, iceCandidates, dtlsParameters } = data;
    console.log(data);

    //make a transport on the client (producer)
    const transport = device.createSendTransport({
        id, iceParameters, iceCandidates, dtlsParameters
    })
    producerTransport = transport;

    producerTransport.on('connect',
        async ({ dtlsParameters }, callback, errback) => {
            console.log('Transport connect ');

            //connect comes with local dtlsParameters after  await producerTransport.produce({ track })
            //we need to send these to server , so we can finish connection

            const resp = await socket.emitWithAck('connect-transport', { dtlsParameters });
            if (resp === "success") {
                callback();
            } else {
                errback();
            }
            console.log(resp);

        },
    );
    producerTransport.on('produce',
        async (parameters, callback, errback) => {
            console.log('Transport produce');

            const { kind, rtpParameters } = parameters;
            const resp = await socket.emitWithAck('start-producing', { kind, rtpParameters });
            if (resp === "error") {
                errback();
            } else {
                callback({ id: resp })
            }
            // console.log(resp);
            publishButton.disabled = true;
            createConsButton.disabled = false
        },
    );

    createProdButton.disabled = true
    publishButton.disabled = false
}

const publish = async () => {
    const track = localStream.getVideoTracks()[0];
    producer = await producerTransport.produce({ track })
}


const createConsumer = async () => {

    // asdk the socket.io server for transport information
    const data = await socket.emitWithAck('create-consumer-transport');
    const { id, iceParameters, iceCandidates, dtlsParameters } = data;
    console.log(data);

    //make a transport on the client (producer)
    const transport = device.createRecvTransport({
        id, iceParameters, iceCandidates, dtlsParameters
    })
    cunsumerTransport = transport;

    cunsumerTransport.on('connect',
        async ({ dtlsParameters }, callback, errback) => {
            console.log('Transport connect ');

            //connect comes with local dtlsParameters after  await cunsumerTransport.counsume({ track })
            //we need to send these to server , so we can finish connection

            const resp = await socket.emitWithAck('connect-consumer-transport', { dtlsParameters });
            if (resp === "success") {
                callback();
            } else {
                errback();
            }

        },
    );

    createConsButton.disabled = true;
    consumeButton.disabled = false;
}

const consume = async () => {
    // emit consume-media event 

    const counsumerParams = await socket.emitWithAck('consume-media', { rtpCapabilities: device.rtpCapabilities });
    if (counsumerParams === "noProducer") {
        console.log(counsumerParams);
    } else if (counsumerParams === "cantConsume") {
        console.log(counsumerParams);
    } else {
        consumer = await cunsumerTransport.consume(counsumerParams);
        const { track } = consumer;
        remoteVideo.srcObject = new MediaStream([track]);
        console.log("Track is Ready... ");
        await socket.emitWithAck('unpauseConsumer');
        console.log("Track is Live !");
    }
}


function addScoketListeners() {
    socket.on('connect', () => {
        connectButton.innerHTML = "connected";
        deviceButton.disabled = false;
    })
}


const disconnect = async () => {

    const closedResp = await socket.emitWithAck('close-all');
    if(closedResp === "closeError"){
        console.log(closedResp);
    }

    producerTransport?.close();
    cunsumerTransport?.close();
}