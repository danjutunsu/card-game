import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Card from './Card';
import LoginForm from './Components/LoginForm';
import LoginPage from './Components/LoginPage';
import CreateForm from './Components/CreateForm';

function App() {
  const [showLogin, setShowLogin] = useState(true);

  const handleClick = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div>
      {showLogin ? (
        <LoginPage />
      ) : (
        <CreateForm onLogin={function (username: string, password: string): void {
            throw new Error('Function not implemented.');
          } } />
      )}
      <button onClick={handleClick}>{showLogin ? 'Create Account' : 'Already Registered? Sign In'}</button>
    </div>
  );
}

export default App;
