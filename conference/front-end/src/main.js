import './style.css';
import buttons from './../uiStuff/uiButtons';
import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';

const socket = io.connect("http://localhost:3031");

socket.on('connect', () => {
  console.log("test");
})

const joinRoom = async () => {
  const userName = document.getElementById('username').value;
  const roomName = document.getElementById('room-input').value;

  const joinRoomesp = await socket.emitWithAck('joinRoom', { userName, roomName });
}
buttons.joinRoom.addEventListener('click', joinRoom);