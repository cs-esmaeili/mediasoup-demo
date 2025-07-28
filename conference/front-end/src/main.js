import './style.css';
import buttons from './../uiStuff/uiButtons';

const joinRoom = () => {
  // console.log("join");

  const userName = document.getElementById('username').value;
  const roomName = document.getElementById('room-input').value;
}
buttons.joinRoom.addEventListener('click', joinRoom);