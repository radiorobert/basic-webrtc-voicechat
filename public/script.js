const socket = io('/');
const userGrid = document.getElementById('person-grid');

const myPeer = new Peer(undefined, {  // let server gen id
  host: '/',
  port: '3001'
});

const myAudio = document.createElement('audio');
myAudio.setAttribute('id', "person");
myAudio.muted = true;  // ensure you can't hear your own audio

const peers = {}

// get the media devices
navigator.mediaDevices.getUserMedia({
  audio: true,
}).then(stream => {
  addAudioStream(myAudio, stream);

  // Answer a stream if there's a call
  myPeer.on('call', call => {
    call.answer(stream);

    const audio = document.createElement('audio');
    audio.setAttribute("id", "person");
    call.on('stream', userAudioStream => {
      addAudioStream(audio, userAudioStream);
    });
  });

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  });
});

// handle disconnect
socket.on('user-disconnected', userId => {
  if(peers[userId]) {
    peers[userId].close();
  }

});

// establish peer connection
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

socket.on('user-connected', userId => {
  console.log('User connected: ' + userId);
});

/* send the stream to someone, and also hear their stream */
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const audio = document.createElement('audio');
  audio.setAttribute("id", "person");

  call.on('stream', userAudioStream => {
    addAudioStream(audio, userAudioStream);
  });

  call.on('close', () => {
    audio.remove();
  });

  // link the user id to calls
  peers[userId] = call;
}

/* Add the audio to the DOM */
function addAudioStream(audio, stream) {
  audio.srcObject = stream;
  audio.addEventListener('loadedmetadata', () => { audio.play() });

  userGrid.append(audio);
}
