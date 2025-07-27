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


## Summary

- A single send transport can support multiple producers.
- Each producer is tied to a single media track (audio or video).
- DTLS and ICE are negotiated per transport.
- `kind` and `rtpParameters` are crucial for setting up each media stream.

