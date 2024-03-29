import React, { useContext, useEffect, useState } from 'react';
import './App.css';
import Card from './Components/Card';
import LoginPage from './Components/LoginPage';
import CreateForm from './Components/CreateForm';
import './styles.css';
import { BrowserRouter, Route, Routes, Link, useLocation, HashRouter } from 'react-router-dom';
import Statistics from './Components/Statistics';
import axios from 'axios';
import { url } from './Config';
import { AppState } from './store';
import { useSelector } from 'react-redux';
import Lobby from './Components/Lobby';
import WaitingRoom from './Components/WaitingRoom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPoints, setUserPoints] = useState(Object);
  const [message, setMessage] = useState('1');
  const userId = useSelector((state: AppState) => state.userId);
  const gameInProgress = useSelector((state: AppState) => state.gameInProgress);

  useEffect(() => {
    getUserPoints(parseInt(userId))
  }, [userId])

  const getUserPoints = async (uid: number) => {
    try {
        const response = await axios.get(`${url}/points`, {
            params: 
            {
                userId: uid,
            },
        });
        console.log(`points: ${response.data}`)
        setUserPoints(response.data[0]);             
    } catch (error) {
        console.error(error);
    }
  }   

  return (
      <><HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {!gameInProgress ? (
          <Route path="/card/" element={<Statistics />} />
        ) : (
          <Route path="/card/" element={<Card />} />
        )}
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/create" element={<CreateForm />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </HashRouter></>
  );
}

export default App;
