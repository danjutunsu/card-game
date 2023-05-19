import React, { useContext, useEffect, useState } from 'react';
import './App.css';
import Card from './Card';
import LoginPage from './Components/LoginPage';
import CreateForm from './Components/CreateForm';
import './styles.css';
import { BrowserRouter, Route, Routes, Link, useLocation } from 'react-router-dom';
import Statistics from './Statistics';
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
  const storeId = useSelector((state: AppState) => state.userId);
  const userId = parseInt(storeId)


  useEffect(() => {
    console.log('uids ' + storeId)
    getUserPoints(userId)
  }, [userId])

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
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/create" element={<CreateForm onLogin={function (username: string, password: string): void {
          throw new Error('Function not implemented.');
        } } />} />
         <Route path="/stats" element={<Statistics />} />
      </Routes>
    </BrowserRouter></>
  );
}

export default App;
