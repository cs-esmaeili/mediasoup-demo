# MediaSoup Client Flow Overview

This document describes the detailed step-by-step flow of setting up MediaSoup client-side logic for sending audio/video using a socket-based signaling system.

## 1. Connect to the Signaling Server (via socket.io)

- Client initiates a connection to the signaling server using `socket.io`.
- Once connected, the server is ready to handle further signaling steps.

## 2. Load RTP Capabilities from Server

- Client creates a `mediasoup-client` Device instance.
- Client emits `getRouterRtpCapabilities` to the server.
- Server responds with its RTP capabilities.
- Client loads those capabilities using `device.load({ routerRtpCapabilities })`.

## 3. Create a Send Transport

- Client emits `createWebRtcTransport` with direction `"send"`.
- Server creates a WebRTC transport and sends back its `id`, `iceParameters`, `iceCandidates`, and `dtlsParameters`.
- Client uses this data to create a `device.createSendTransport(...)`.

## 4. Listen to Transport Events (on client)

The following event listeners are attached to the client's send transport:
 step 6 `connect`
 step 7 `produce`

## 5. Create Media Stream & Produce

- Client gets media from the webcam using `getUserMedia`.
- For each track (audio/video), call `sendTransport.produce({ track })`.

> Note: Each track (audio and video) creates its own **Producer** on the same transport.
## 6. `connect` listener on transport on client will be call after  `sendTransport.produce({ track })`

- Client sends `connectTransport` to server with `dtlsParameters`.
- Server calls `transport.connect({ dtlsParameters })` and responds. (if response will be success produce listener will be call (step 7) )

## 7. `produce`

- Client passes `kind` (audio or video) and `rtpParameters`. ( base on what client want to send )
- Server creates a producer on the transport with `transport.produce({ kind, rtpParameters })`.
- Server stores the `producer` instance and.
- Server responds with the newly created `producerId`. (and server send this id of producer on server to client)

## 8.  `Begin produce`

- Client get `localStream` track 
- Client use `produce` on Producer transport to send media

## 9. `Consumer`

- Client emits `create-consumer-transport`
- server gives { id, iceParameters, iceCandidates, dtlsParameters } for `create-consumer-transport` to client just like Producer transport
- Client make a RecvTransport base on that parameters
- Client add a connect listener to the transport to use when trasport got connected

## 10.  `Begin Counsume`

- Client emits `consume-media` with { rtpCapabilities: device.rtpCapabilities }
- server use `consume` method on consumer Trasport on server { producerId: theProducer.id, rtpCapabilities, paused: true } gives client { producerId , id , kind , rtpParameters}
- Client use that data to use `consume` on consumer transport on client too and extrac {track} formconsumer
- Client `Connect Listener` on consumer transport will be triggered to emit `connect-consumer-transport` to finish connection with server
- Client emits `unpauseConsumer`
- server will use `resume` to consumer

## 10.  we Live now !
