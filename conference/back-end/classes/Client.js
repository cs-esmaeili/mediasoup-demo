class Client {
    constructor(userName, socket, router) {
        this.userName = userName;
        this.socket = socket;
        this.upstreamTransport = null;
        this.producer = {};
        this.downstreamTransports = [];
        this.consumers = [];
        this.router = this.router;
        this.room = null;
    }
}

module.exports = Client;