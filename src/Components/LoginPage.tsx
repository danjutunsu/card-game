import axios from "axios";
import { useState } from "react";
import LoginForm from "./LoginForm";
import { url } from "../Config";
import Card from "../Card";
import '../styles.css';

const LoginPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${url}/api/login`, {
        username: username,
        password: password,
      });
      if (response.status === 200) {
        // if the login is successful, store the token in localStorage and update loggedIn state
        localStorage.setItem("token", response.data.token);
        setLoginFailed(false);
        setLoggedIn(true);
      } else {
        // if the login fails, display an error message
        alert(response.data.error || response.data.message);
      }
    } catch (error) {
    setLoginFailed(true);
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-header">Login</h1>
      {!loggedIn && <LoginForm onLogin={handleLogin} />}
      {loggedIn && (
        <div>
          <h2>You are logged in!</h2>
          <Card />
        </div>
      )}
      {loginFailed && (
        <div>
            <p className="error-message">Username/password combination not valid. Please try again or create a new account.</p>
        </div>
      )}      
    </div>
  )
};

export default LoginPage;
