const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in this sandbox
    methods: ["GET", "POST"]
  }
});

// State
let users = {}; // socket.id -> { username, roomId }
let rooms = {}; // roomId -> { id, name, gameType, players: [socket.id], board: [], turn: 0 }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User Login
  socket.on('login', (username) => {
    console.log(`User login: ${username} (${socket.id})`);
    users[socket.id] = { username, roomId: null };
    socket.emit('login_success', { id: socket.id, username });
    io.emit('room_list', Object.values(rooms));
  });

  // Create Room
  socket.on('create_room', ({ roomName, gameType }) => {
    console.log(`Create room: ${roomName}, type: ${gameType}, by ${socket.id}`);
    const roomId = Math.random().toString(36).substring(7);
    const newRoom = {
      id: roomId,
      name: roomName,
      gameType,
      players: [socket.id],
      board: initializeBoard(gameType),
      turn: socket.id, // Creator starts first
      status: 'waiting' // waiting, playing
    };
    rooms[roomId] = newRoom;
    users[socket.id].roomId = roomId;

    socket.join(roomId);
    socket.emit('room_joined', newRoom);
    io.emit('room_list', Object.values(rooms));
  });

  // Join Room
  socket.on('join_room', (roomId) => {
    console.log(`Join room request: ${roomId} from ${socket.id}`);
    const room = rooms[roomId];

    if (!room) {
        socket.emit('error', 'Room does not exist');
        return;
    }

    if (room.players.includes(socket.id)) {
        // User already in room, just update
        socket.join(roomId);
        socket.emit('room_updated', room);
        return;
    }

    if (room.players.length < 2) {
      room.players.push(socket.id);
      users[socket.id].roomId = roomId;
      socket.join(roomId);

      room.status = 'playing';

      socket.emit('room_joined', room);
      io.to(roomId).emit('room_updated', room);
      io.emit('room_list', Object.values(rooms));
    } else {
      socket.emit('error', 'Room is full');
    }
  });

  // Leave Room
  socket.on('leave_room', () => {
    handleLeaveRoom(socket);
  });

  // Game Move
  socket.on('make_move', ({ roomId, move }) => {
    const room = rooms[roomId];
    if (room && room.status === 'playing' && room.turn === socket.id) {
        // Validate and Apply Move
        if (isValidMove(room, move)) {
            applyMove(room, move);
            // Switch turn
            const otherPlayer = room.players.find(id => id !== socket.id);
            room.turn = otherPlayer;
            io.to(roomId).emit('room_updated', room);
        }
    }
  });

  // Chat
  socket.on('send_message', (message) => {
    const user = users[socket.id];
    if (user && user.roomId) {
        io.to(user.roomId).emit('receive_message', { user: user.username, text: message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    handleLeaveRoom(socket);
    delete users[socket.id];
  });
});

function handleLeaveRoom(socket) {
    const user = users[socket.id];
    if (user && user.roomId) {
        const room = rooms[user.roomId];
        if (room) {
            room.players = room.players.filter(id => id !== socket.id);
            socket.leave(user.roomId);
            user.roomId = null;

            if (room.players.length === 0) {
                delete rooms[room.id];
            } else {
                room.status = 'waiting'; // Or 'opponent_left'
                io.to(room.id).emit('room_updated', room);
            }
            io.emit('room_list', Object.values(rooms));
        }
    }
}

function initializeBoard(gameType) {
    if (gameType === 'go' || gameType === 'renju') {
        // 19x19 grid for Go, 15x15 for Renju usually, but let's stick to 15x15 for both or 19x19.
        // Let's use 15x15 for simplicity and compatibility.
        const size = gameType === 'go' ? 19 : 15;
        return Array(size).fill(null).map(() => Array(size).fill(null));
    } else if (gameType === 'chess') {
        // Simplified Chess Board Rep
        // null = empty, Strings for pieces 'wP', 'bP', 'wK', etc.
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        // Setup pieces (simplified)
        // For this prototype, I'll just initialize an empty board or a very basic setup
        // Implementing full chess rules is huge. I'll focus on allowing pieces to be placed.
        // Or better, let's just initialize the standard chess board.
        const pieces = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        for(let i=0; i<8; i++) {
            board[1][i] = 'bP'; // Black Pawns
            board[6][i] = 'wP'; // White Pawns
            board[0][i] = 'b' + pieces[i]; // Black Pieces
            board[7][i] = 'w' + pieces[i]; // White Pieces
        }
        return board;
    }
    return [];
}

function isValidMove(room, move) {
    // move: { x, y } for Go/Renju, { from: {r, c}, to: {r, c} } for Chess
    // This is a simplified validation.
    return true;
}

function applyMove(room, move) {
    if (room.gameType === 'go' || room.gameType === 'renju') {
        const { x, y } = move;
        if (room.board[y][x] === null) {
            room.board[y][x] = room.turn === room.players[0] ? 'black' : 'white'; // First player is usually black in Go/Renju
        }
    } else if (room.gameType === 'chess') {
        const { from, to } = move;
        // Basic move: just overwrite the target square
        const piece = room.board[from.r][from.c];
        room.board[from.r][from.c] = null;
        room.board[to.r][to.c] = piece;
    }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
