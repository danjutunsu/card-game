  import axios from "axios";
  import { useContext, useEffect, useState } from "react";
  import LoginForm from "./LoginForm";
  import { url } from "../Config";
  import Card from "../Card";
  import '../styles.css';
  import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
  import { useNavigate } from 'react-router-dom';
  import CreateForm from "./CreateForm";
  import UserContext, { UserContextType } from "./UserContext";
  import { connect, useDispatch } from 'react-redux';
  import { store } from "../store";
  import { io } from 'socket.io-client';



  const MyComponent: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInCard, setLoggedInCard] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [userId, setUserId] = useState('')
  const dispatch = useDispatch();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${url}/api/login`, {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        console.log('userID: ' + response.data.userId)
        // const res = await axios.post(`${url}/api/lobby`, {
        //   userId: userId
        // })
        // Associates the UserId with the socket. 
        // -- Passes the userId parameter to the socket to be stored in the array.
        // const socket = new WebSocket(`ws://localhost:3002?userId=${response.data.userId}`)

        // Connection opened
        // socket.addEventListener('open', function (event) {
          // socket.send('Sello Server!');
        // });

        // // Listen for messages
        // socket.addEventListener('message', function (event) {
        //   console.log('Message from server ', event.data);
        // });

        // Connection closed
        // socket.addEventListener('close', function (event) {
        //   console.log('WebSocket connection closed');
        // });

        setUserId(response.data.userId)
        // continue with your code
        localStorage.setItem("token", response.data.token);
        setLoginFailed(false);
        setLoggedIn(true);
        setTimeout(() => {
          setLoggedIn(false);
          setLoggedInCard(true);
          // Update the user context value
          const loggedInUser = response.data.userId
          // console.log("USER ID::: " + response.data.userId)
          setUser(loggedInUser)

        // Dispatch an action to set the user ID in the Redux store
        dispatch({ type: 'SET_USER_ID', payload: loggedInUser });
          // navigate('/card', { state: { id: userId } });
          navigate('/lobby')
        }, 1000);
      } else {
        // if the login fails, display an error message
        alert(response.data.error || response.data.message);
      }
    } catch (error) {
      setLoginFailed(true);
      console.error(error);
    }
  };
    
const [showLogin, setShowLogin] = useState(true);

const handleClick = () => {
  setShowLogin(!showLogin);
  };

  return (
    <div className="login-page">    
      <h1 className="login-header">Login</h1>
      {!loggedIn && !loggedInCard && <LoginForm onLogin={handleLogin} />}
      {loggedInCard && <Card />}
      {loggedIn && (
        <div>
          <h2>You are logged in!</h2>
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

function mapStateToProps(state: { userId: number }) {
    return {
      userId: state.userId
    };
}
  
function mapDispatchToProps(dispatch: (arg0: { type: string; payload?: any; }) => any) {
  return {
    updateId: (userId: number) => dispatch({ type: 'UPDATE_Id', payload: userId })
  };
}
  

const LoginPage = () => {
    return (
        <MyComponent />
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
