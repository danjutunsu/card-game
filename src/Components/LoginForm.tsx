import { useEffect, useState } from "react";
import bcrypt from "bcryptjs"; 
import axios from "axios";
import { bEnd } from "../Config";
import CreateForm from "./CreateForm";
import '../styles.css';
import { Link } from "react-router-dom";


type LoginFormProps = {
    onLogin: (username: string, password: string) => void;
  }
  
  
  const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('swag');
    const [showAccountCreation, setShowAccountCreation] = useState(false);
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // addUser(2, username, password)
        onLogin(username, password);
    };
    
    // useEffect(() => {
    //     addUser(2, username, password)
    //     console.log("setting")

    //     // console.log("visited: ", visited);
    // }, );

    const addUser = async (uid: number, uName: string, password: string) => {
        try {
          const hashedPassword = bcrypt.hashSync(password, 10); // hash the password
          console.log("HASHED: " + hashedPassword)
          console.log(password)
  
          const response = await axios.post(`${bEnd}/users`, {
            userId: uid,
            userName: uName,
            password: hashedPassword // send the hashed password to the backend
          });
  
        } catch (error) {
          console.error(error);
        }
      }

      const handleCreateAccountClick = () => {
        setShowAccountCreation(true);
      };

      return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <label className="form-label">
                    <span className="label-text">Username:</span>
                    <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} />
                </label>
                <br />
                <label className="form-label">
                    <span className="label-text">Password:</span>
                    <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </label>
                <br />
                <div className="button-container">
                    <button className="button">Login</button>
                </div>
                <div className='button-container'>
                    <button className="button">
                        <Link to="/create" className="button-link">Create Account</Link>
                    </button>
                </div>   
            </form>
        </div>
    );
  };
  
  export default LoginForm