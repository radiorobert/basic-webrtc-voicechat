const socket = io('/');
const myPeer = new Peer(undefined, {  // let server gen id
  host: '/',
  port: '3001'
});

// establish peer connection
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

socket.on('user-connected', userId => {
  console.log('User connected: ' + userId);
});
