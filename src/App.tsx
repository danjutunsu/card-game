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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('0');
  const [userId, setUserId] = useState(1)
  const [userPoints, setUserPoints] = useState(Object);
  const [message, setMessage] = useState('');
  const storeId = ((state: AppState) => state.userId);

  useEffect(() => {
    getUserPoints(userId)
  })

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
          user={storeId.toString()}
          points={userPoints.points}
          correctlyAnswered={userPoints.correct_round}
          totalQuestions={userPoints.total_round}
          totalCorrect={userPoints.total_correct}
          totalIncorrect={userPoints.total_incorrect}
          totalHistorical={userPoints.total_guess} />} />
      </Routes>
    </BrowserRouter></>
  );
}

export default App;
