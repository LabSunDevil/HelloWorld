import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';

const socket = io();

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    socket.on('login_success', (userData) => {
      setUser(userData);
    });

    return () => {
      socket.off('login_success');
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <header style={{ padding: '10px', background: '#282c34', color: 'white' }}>
            <h1>Game Lobby</h1>
            {user && <div>Welcome, {user.username}</div>}
        </header>
        <Routes>
          <Route path="/" element={<Lobby user={user} setUser={setUser} />} />
          <Route path="/room/:roomId" element={<GameRoom user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function Lobby({ user, setUser }) {
  const [username, setUsername] = useState('');
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('room_list', (roomList) => {
      setRooms(roomList);
    });

    socket.on('room_joined', (room) => {
        console.log('Room joined event received', room);
        setTimeout(() => {
            console.log('Navigating to room', room.id);
            navigate(`/room/${room.id}`);
        }, 0);
    });

    return () => {
      socket.off('room_list');
      socket.off('room_joined');
    };
  }, [navigate]);

  const handleLogin = () => {
    if (username.trim()) {
      socket.emit('login', username);
    }
  };

  const createRoom = (gameType) => {
    const roomName = `${username}'s ${gameType} Room`;
    socket.emit('create_room', { roomName, gameType });
  };

  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
    // Navigate is handled by room_joined event or similar confirmation
    // Ideally we should wait for confirmation.
    // However, since socket.on('room_joined') is global in this component, it might trigger.
    // Let's rely on the socket event to navigate.
  };

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Login</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Username"
        />
        <button onClick={handleLogin}>Enter Lobby</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lobby</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Create Room</h3>
        <button onClick={() => createRoom('go')}>Create Go Room</button>
        <button onClick={() => createRoom('renju')}>Create Renju Room</button>
        <button onClick={() => createRoom('chess')}>Create Chess Room</button>
      </div>
      <div>
        <h3>Available Rooms</h3>
        {rooms.length === 0 ? <p>No rooms available.</p> : (
            <ul>
                {rooms.map(room => (
                    <li key={room.id}>
                        {room.name} ({room.gameType}) - {room.status}
                        {room.status === 'waiting' && (
                             <button onClick={() => joinRoom(room.id)}>Join</button>
                        )}
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
}

function GameRoom({ user }) {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If user enters directly via URL without login (in a real app check auth)
    // Here we assume user is set from App state

    socket.emit('join_room', roomId); // Attempt to re-join if refreshed?
    // Actually, simpler logic: if room state is null, we are waiting for update.
    // The server handles re-joins if socket is same, but on refresh socket changes.
    // For this prototype, let's rely on the flow from Lobby.
    // But we need to listen for room updates.

    socket.on('room_updated', (updatedRoom) => {
        setRoom(updatedRoom);
    });

    socket.on('error', (msg) => {
        alert(msg);
        navigate('/');
    });

    return () => {
      socket.off('room_updated');
      socket.off('error');
    };
  }, [roomId, navigate]);

  const leaveRoom = () => {
    socket.emit('leave_room');
    navigate('/');
  };

  const makeMove = (move) => {
      socket.emit('make_move', { roomId, move });
  };

  if (!room) return <div>Loading Room...</div>;

  const isMyTurn = room.turn === socket.id;
  const statusMessage = room.status === 'waiting'
    ? 'Waiting for opponent...'
    : (isMyTurn ? 'Your Turn' : "Opponent's Turn");

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={leaveRoom}>Leave Room</button>
      <h2>{room.name}</h2>
      <p>Game: {room.gameType}</p>
      <p>Status: {statusMessage}</p>

      <div style={{ marginTop: '20px' }}>
        {room.gameType === 'go' || room.gameType === 'renju' ? (
             <GoBoard
                board={room.board}
                onMove={(x, y) => isMyTurn && makeMove({ x, y })}
                isMyTurn={isMyTurn}
             />
        ) : (
             <ChessBoard
                board={room.board}
                onMove={(from, to) => isMyTurn && makeMove({ from, to })}
                isMyTurn={isMyTurn}
             />
        )}
      </div>
    </div>
  );
}

function GoBoard({ board, onMove, isMyTurn }) {
    const size = board.length;
    const cellSize = 30;

    return (
        <div
            data-testid="go-board"
            style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
            gap: '1px',
            backgroundColor: '#DDBB99',
            border: '1px solid black',
            width: 'fit-content'
        }}>
            {board.map((row, y) => (
                row.map((cell, x) => (
                    <div
                        key={`${x}-${y}`}
                        onClick={() => onMove(x, y)}
                        style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isMyTurn ? 'pointer' : 'default',
                            position: 'relative'
                        }}
                    >
                        {/* Grid lines */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: '1px',
                            backgroundColor: 'black',
                            zIndex: 0
                        }} />
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            backgroundColor: 'black',
                            zIndex: 0
                        }} />

                        {cell && (
                            <div style={{
                                width: '80%',
                                height: '80%',
                                borderRadius: '50%',
                                backgroundColor: cell,
                                border: '1px solid #333',
                                zIndex: 1
                            }} />
                        )}
                    </div>
                ))
            ))}
        </div>
    );
}

function ChessBoard({ board, onMove, isMyTurn }) {
    const [selected, setSelected] = useState(null);

    const handleClick = (r, c) => {
        if (!isMyTurn) return;

        if (selected) {
            // Move
            onMove(selected, { r, c });
            setSelected(null);
        } else {
            // Select if there is a piece (simplified check)
            if (board[r][c]) {
                setSelected({ r, c });
            }
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(8, 50px)`,
            border: '5px solid #333',
            width: 'fit-content'
        }}>
            {board.map((row, r) => (
                row.map((piece, c) => {
                    const isBlack = (r + c) % 2 === 1;
                    const isSelected = selected && selected.r === r && selected.c === c;
                    return (
                        <div
                            key={`${r}-${c}`}
                            onClick={() => handleClick(r, c)}
                            style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: isSelected ? 'yellow' : (isBlack ? '#769656' : '#EEEED2'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                cursor: isMyTurn ? 'pointer' : 'default'
                            }}
                        >
                            {renderChessPiece(piece)}
                        </div>
                    );
                })
            ))}
        </div>
    );
}

function renderChessPiece(code) {
    if (!code) return '';
    const symbols = {
        'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
        'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
    };
    return symbols[code] || code;
}

export default App;
