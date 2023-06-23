  import axios from "axios";
  import { useContext, useEffect, useState } from "react";
  import LoginForm from "./LoginForm";
  import { url } from "../Config";
  import Card from "./Card";
  import '../styles.css';
  import { useNavigate } from 'react-router-dom';
  import { connect, useDispatch } from 'react-redux';
  import {v4 as uuidv4} from 'uuid';
  import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
  import bcrypt from "bcryptjs"; 


const MyComponent: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInCard, setLoggedInCard] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const randomId = uuidv4();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const dispatch = useDispatch();

  const verifyToken = (token: any) => {
    console.log(`token::${token}`)

    axios
      .post(`${url}/verify`, {
          token: token,
      })
      .then((response) => {
        // Handle the response data from the server
        console.log('User information:', response.data);
        console.log(`EMAIL: ${response.data.email}`)

        handleGoogleLogin(response.data.email)
      })
      .catch((error) => {
        // Handle the error
        console.error('Verification failed:', error);
      });
  };

  // useEffect(() => {
  //   console.log(`USER`)
  //   if (user && user.accessToken) {
  //     axios
  //       .get("https://www.googleapis.com/oauth2/v1/userinfo", {
  //         headers: {
  //           Authorization: `Bearer ${user.accessToken}`,
  //           Accept: "application/json",
  //         },
  //       })
  //       .then((res) => {
  //         setProfile(res.data);
  //       })
  //       .catch((err) => console.log(err));
  //   }
  // }, [user]);

  const addUser = async (uName: string, email: string) => {
    // console.log(`CREATING USER`)
    try {
      const hashedPassword = bcrypt.hashSync(email, 10); // hash the password
      console.log("HASHED: " + hashedPassword)
      console.log(email)

      const response = await axios.post(`${url}/users`, {
        userName: uName,
        email: email,
        password: hashedPassword // send the hashed password to the backend
      });
      setSubmitMessage('User Created')
      // console.log(`USERID AFTER CREATION: ${response.data.id}`)

      // CREATING NEW USER ROW IN POINTS
      try {
        const res = await axios.post(`${url}/points`, {
          userId: response.data.id
        });
        setSubmitMessage('User Created IN POINTS')
      } catch (error) {
        setSubmitMessage('Error Creating User IN POINTS')
        console.error(error);
        alert(`Please ensure that the userId is correct.`)
        }
    } catch (error) {
      setSubmitMessage('Error Creating User')
      console.error(error);
      // console.log(`An Error occured while saving the user`)
      // alert(`Please ensure that the email address is unique, or log in if your email is already registered.`)
      }
  }

  const handleGoogleLogin = async (email: string) => {
    console.log(`RandomID: ${randomId}`)
    
    try {
      const response = await axios.get(`${url}/users/email`, {
        params: {
          email: email
        }
      });
      addUser(email, email)
      console.log(`ADDING USER`)

      console.log(response.status)
    } catch (error) {
      console.log(`EMAIL ALREADY EXISTS....LOGGING IN ${error}`)
    }

    try {
      const response = await axios.post(`${url}/login/google`, {
        email: email
      });

      console.log(`USERNAME:::::${response.data.username}`)
      
      if (response.status === 200) {
        setUserId(response.data.userId)
        // continue with your code
        localStorage.setItem("token", response.data.token);
        console.log(`Token: ${response.data.token}`)
        setLoginFailed(false);
        setLoggedIn(true);
        const token = localStorage.getItem('token');
        console.log(`TOKEN IN STORAGE: ${token}`)
        setTimeout(() => {
          setLoggedIn(false);
          setLoggedInCard(true);
          // Update the user context value
          const loggedInUser = response.data.userId
          // console.log("USER ID::: " + response.data.userId)
          setUser(loggedInUser)

        // Dispatch an action to set the user ID in the Redux store
        console.log(`SETTING USER ID TO: ${loggedInUser}`)
        dispatch({ type: 'SET_USER_ID', payload: loggedInUser });
          // navigate('/card', { state: { id: userId } });
            handleUpdateUUID(response.data.userId, randomId)
            console.log(`UserId: ${loggedInUser} RandomID: ${randomId}`)
            navigate(`/lobby/${randomId}`)
        }, 1000);
      } else {
        // if the login fails, display an error message
        // alert(response.data.error || response.data.message);
      }
    } catch (error) {
      setLoginFailed(true);
      console.error(error);
      addUser(email, email)

    }
  };

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
        console.log(`Token: ${response.data.token}`)
        setLoginFailed(false);
        setLoggedIn(true);
        const token = localStorage.getItem('token');
        console.log(`TOKEN IN STORAGE: ${token}`)
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
  const responseMessage = (response: any) => {
    console.log(`RESPONSE`)
    console.log(response);
    verifyToken(response.credential)
  };
  
  const errorMessage = (error: any) => {
      console.log(error);
  };

const handleClick = () => {
  setShowLogin(!showLogin);
  };

  return (
    <><div className="google-login">
      <GoogleLogin onSuccess={responseMessage} onError={() => console.log(errorMessage)} />
    </div><div className="login-page">
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
      </div></>
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

