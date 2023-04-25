import axios from "axios";
import { useState } from "react";
import LoginForm from "./LoginForm";
import { url } from "../Config";
import Card from "../Card";

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
    <div>
      <h1>Login</h1>
      {!loggedIn && <LoginForm onLogin={handleLogin} />}
      {loggedIn && (
        <div>
          <h2>You are logged in!</h2>
          <Card />
        </div>
      )}
      {loginFailed && (
        <div>
            <h2>Wrong Credentials</h2>
        </div>
      )}      
    </div>
  )
};

export default LoginPage;
