const express = require('express');
const http = require('http');
const socket_IO = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socket_IO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


app.use(cors());

// socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected.');

  socket.on('join', ({ role, meetingId, managerId }) => {
    const room = `meeting_${meetingId}_manager_${managerId}`;
    console.log(`${role} joined room: ${room}`);
    socket.join(room);
    socket.room = room;
  });


  // Handle note updates
  socket.on('update_note', ({ meetingId, managerId, content }) => {
    const room = `meeting_${meetingId}_manager_${managerId}`;
    console.log(`Note updated in room: ${room}, Content: ${content}`);

    // Broadcast the update to all users in the room (except the sender)
    socket.to(room).emit('note_updated', content);
  });




  // Handle convo updates
  socket.on('from_client_convo_update', ({ meetingId, managerId, content }) => {
    const room = `meeting_${meetingId}_manager_${managerId}`;
    console.log(`Convo updated in room: ${room}, Content: ${content}`);

    // Broadcast the update to all users in the room (except the sender)
    socket.to(room).emit('conversation_updated', content);
  });


  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
