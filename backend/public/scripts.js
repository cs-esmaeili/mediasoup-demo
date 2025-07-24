let socket = null;
let device = null;

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

    console.log(device.loaded);
    
}

function addScoketListeners() {
    socket.on('connect', () => {
        connectButton.innerHTML = "connected";
        deviceButton.disabled = false;
    })
}