const createWebRtcTransportBothKinds = (router) => new Promise(async (resolve, reject) => {
    const transport = await router.createWebRtcTransport({
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        listenInfos: [
            {
                protocol: 'udp',
                ip: '0.0.0.0',
                announcedAddress: '192.168.1.2',
            },
            {
                protocol: 'tcp',
                ip: '0.0.0.0',
                announcedAddress: '192.168.1.2',
            }
        ]
    })
    // console.log(transport)
    const clientTransportParams = {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
    }
    resolve({ transport, clientTransportParams })
})

module.exports = createWebRtcTransportBothKinds