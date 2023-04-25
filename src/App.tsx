import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Card from './Card';
import LoginForm from './Components/LoginForm';
import LoginPage from './Components/LoginPage';
import CreateForm from './Components/CreateForm';
import './styles.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/card" element={isAuthenticated ? <Card /> : <Card />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create" element={<CreateForm onLogin={function (username: string, password: string): void {
          throw new Error('Function not implemented.');
        } } />} />
      {/* <Route path="/not-authorized" element={NotAuthorized} />
      <Route path="/dashboard" element={Dashboard} isAuthenticated={isAuthenticated} /> */}
      {/* <Route path="/card/*" element={<Card />} isAuthenticated={isAuthenticated} /> */}
    </Routes>
  </BrowserRouter>
  );
}

export default App;
