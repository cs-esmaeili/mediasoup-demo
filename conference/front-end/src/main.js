import './style.css';
import buttons from './../uiStuff/uiButtons';
import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';

const socket = io.connect("http://localhost:3031");

socket.on('connect', () => {
  console.log("test");
})

const joinRoom = () => {
  // console.log("join");

  const userName = document.getElementById('username').value;
  const roomName = document.getElementById('room-input').value;
}
buttons.joinRoom.addEventListener('click', joinRoom);