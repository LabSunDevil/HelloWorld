import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <Link to="/" className="logo">VideoShare</Link>
          <nav>
            {user ? (
              <>
                <Link to="/upload">Upload</Link>
                <span>Welcome, {user.username}</span>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login">Login / Register</Link>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/upload" element={<Upload user={user} />} />
            <Route path="/video/:id" element={<VideoPlayer user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const Home = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Fetch all videos
    axios.get(`${API_URL}/videos`)
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));

    // Fetch recommendations if user is logged in (or generic ones)
    const userId = user ? user.id : '';
    axios.get(`${API_URL}/recommendations?userId=${userId}`)
      .then(res => setRecommendations(res.data))
      .catch(err => console.error(err));
  }, [user]);

  return (
    <div className="home">
      {recommendations.length > 0 && (
        <section>
          <h2>Recommended for You</h2>
          <div className="video-grid">
            {recommendations.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>All Videos</h2>
        <div className="video-grid">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
};

const VideoCard = ({ video }) => (
  <div className="video-card">
    <Link to={`/video/${video.id}`}>
      <div className="thumbnail-placeholder">
        {/* Placeholder for thumbnail since we don't generate them */}
        <span>PLAY</span>
      </div>
      <h3>{video.title}</h3>
      <p>By {video.uploaderName}</p>
    </Link>
  </div>
);

const VideoPlayer = ({ user }) => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/videos/${id}`)
      .then(res => {
        setVideo(res.data);
        // Record view
        if (user) {
          axios.post(`${API_URL}/videos/${id}/view`, { userId: user.id });
        }
      })
      .catch(err => console.error(err));
  }, [id, user]);

  if (!video) return <div>Loading...</div>;

  const videoSrc = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/uploads/${video.filename}`;

  return (
    <div className="video-player-container">
      <video controls width="100%" autoPlay>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <h1>{video.title}</h1>
      <p>{video.description}</p>
      <p>Tags: {video.tags}</p>
      <p>Uploaded by: {video.uploaderName}</p>
    </div>
  );
};

const Upload = ({ user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('uploaderId', user.id);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload successful!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload Video</h2>
      <form onSubmit={handleUpload}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} required />
        <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
      if (isRegistering) {
        // Auto login or ask to login? let's just ask to login for simplicity or auto login
        alert('Registered! Please login.');
        setIsRegistering(false);
      } else {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="login-page">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
};

export default App;
