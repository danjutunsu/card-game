  import axios from "axios";
  import { useContext, useEffect, useState } from "react";
  import LoginForm from "./LoginForm";
  import { url } from "../Config";
  import Card from "./Card";
  import '../styles.css';
  import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
  import { useNavigate } from 'react-router-dom';
  import CreateForm from "./CreateForm";
  import UserContext, { UserContextType } from "./UserContext";
  import { connect, useDispatch } from 'react-redux';
  import { store } from "../store";
  import { io } from 'socket.io-client';
  import {v4 as uuidv4} from 'uuid';


  const MyComponent: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInCard, setLoggedInCard] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [userId, setUserId] = useState('')
  const dispatch = useDispatch();
  const [showLogin, setShowLogin] = useState(true);
  const randomId = uuidv4();

  let hashMap: {[key: string]: string} = {};
  hashMap["key 1"] = "value 1";
  hashMap["key 2"] = "value 2";
  hashMap["key 3"] = "value 3";

  for (var key in hashMap) {
    console.log(`Key: ${key}`)
    console.log(`Value: ${hashMap[key]}`)
  }

  const handleLogin = async (username: string, password: string) => {
    console.log(`RandomID: ${randomId}`)
//
    try {
      const response = await axios.post(`${url}/login`, {
        username: username,
        password: password,
      });

      if (response.status === 200) {
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
            handleUpdateUUID(response.data.userId, randomId)
            console.log(`UserId: ${loggedInUser} RandomID: ${randomId}`)
            navigate(`/lobby/${randomId}`)
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

  const handleUpdateUUID = async (id: string, uuid: string | undefined) => {
    try {
      const response = await axios.put(`${url}/lobby/uuid`, {
        id: id,
        uuid: uuid
      });
      const updatedUser = response.data; // Get updated user object with new status 
    } catch (error) {
      console.error(error);
    }
  }
    
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
