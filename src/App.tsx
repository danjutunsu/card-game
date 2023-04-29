import React, { useContext, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Card from './Card';
import LoginForm from './Components/LoginForm';
import LoginPage from './Components/LoginPage';
import CreateForm from './Components/CreateForm';
import './styles.css';
import { BrowserRouter, Route, Routes, Link, useLocation } from 'react-router-dom';
import Statistics from './Statistics';
import axios from 'axios';
import { url } from './Config';
import UserContext, { UserContextType } from './Components/UserContext';
import io from 'socket.io-client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('0');
  const [userId, setUserId] = useState(1)
  const [userPoints, setUserPoints] = useState(Object);
  // const userContext = useContext<UserContextType>(UserContext);
  const [message, setMessage] = useState('');

  const socket = io('http://localhost:3002', { transports : ['websocket'] });
  socket.emit('message', message);
// emit an event to the server
  socket.emit('hello', 'world');

  // listen for an event from the server
  socket.on('greeting', (message) => {
    console.log(message);
  });

  useEffect(() => {
    getUserPoints(userId)
  })

  // Emit a 'message' event when the form is submitted
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    socket.emit('message', message);
  };

  // Listen for the 'message' event
  useEffect(() => {
    socket.on('message', (data) => {
      console.log(`Received message: ${data}`);
    });
  }, []);
  const getUserPoints = async (uid: number) => {
    try {
        const response = await axios.get(`${url}/api/points`, {
            params: 
            {
                userId: uid,
            },
        });

        setUserPoints(response.data[0]);             
    } catch (error) {
        console.error(error);
    }
  }   

  return (
      <><BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/card" element={<Card />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateForm onLogin={function (username: string, password: string): void {
          throw new Error('Function not implemented.');
        } } />} />
        <Route path="/stats" element={<Statistics
          user={useContext(UserContext).user}
          points={userPoints.points}
          correctlyAnswered={userPoints.correct_round}
          totalQuestions={userPoints.total_round}
          totalCorrect={userPoints.total_correct}
          totalIncorrect={userPoints.total_incorrect}
          totalHistorical={userPoints.total_guess} />} />
      </Routes>
    </BrowserRouter><div>
        <form onSubmit={handleSubmit}>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit">Send</button>
        </form>
      </div></>
  );
}

export default App;
