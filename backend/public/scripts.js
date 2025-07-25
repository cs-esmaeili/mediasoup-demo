let socket = null;
let device = null;
let localStream = null;
let producerTransport = null;

const initConnect = () => {

    socket = io('https://localhost:3030');
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
}

const createProducer = async () => {

    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });

        localVideo.srcoObject = localStream;
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
        },
    );
    producerTransport.on('produce',
        async (parameters, callback, errback) => {
            console.log('Transport produce ');
        },
    );

}

function addScoketListeners() {
    socket.on('connect', () => {
        connectButton.innerHTML = "connected";
        deviceButton.disabled = false;
    })
}