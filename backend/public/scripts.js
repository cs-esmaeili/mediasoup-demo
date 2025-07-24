let socket = null;

const initConnect = () => {

    socket = io('https://localhost:3030');
    connectButton.innerHTML = "connecting ...";
    connectButton.disabled = true;
    addScoketListeners();
}

function addScoketListeners() {
    socket.on('connect', () => {
        connectButton.innerHTML = "connected";
        deviceButton.disabled = false;
    })
}