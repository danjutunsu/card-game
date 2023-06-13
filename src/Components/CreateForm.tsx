import { useEffect, useState } from "react";
import bcrypt from "bcryptjs"; 
import axios from "axios";
import { url } from "../Config";
import { Link } from "react-router-dom";

interface CreateFormProps {
    onLogin: (username: string, password: string) => void;
  }
  
  const CreateForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addUser(username, email, password)
        // onLogin(username, password);
    };
    
    // useEffect(() => {
    //     addUser(2, username, password)
    //     console.log("setting")

    //     // console.log("visited: ", visited);
    // }, );

    const addUser = async (uName: string, email: string, password: string) => {
      console.log(`CREATING USER`)
      if (confirmPassword === password) {  
        try {
          const hashedPassword = bcrypt.hashSync(password, 10); // hash the password
          console.log("HASHED: " + hashedPassword)
          console.log(password)
  
          const response = await axios.post(`${url}/users`, {
            userName: uName,
            email: email,
            password: hashedPassword // send the hashed password to the backend
          });
          setSubmitMessage('User Created')
          console.log(`USERID AFTER CREATION: ${response.data.id}`)

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
          console.log(`An Error occured while saving the user`)
          alert(`Please ensure that the email address is unique, or log in if your email is already registered.`)
          }
      } else {
        setSubmitMessage('Please ensure passwords match')
      }
    }

    return (
      <><form onSubmit={handleSubmit}>
            <h1>
                Create Account:
            </h1>
            <br />
            <label>
                Username:
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
            </label>
            <br />
            <label>
                Email Address:
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <br />
            <label>
                Password:
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <br />
            <label>
                Confirm Password:
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </label>
            <br />
            <label className="submission-message">
            {submitMessage}
            </label>
            <div className='button-container'>
                <button type="submit" className="button">
                    Submit
                </button>
            </div>
        </form><div className='button-container'>
                <button className="button">
                    <Link to="/login" className="button-link">Already registered? Sign in</Link>
                </button>
            </div></> 
    );
  };
  
  export default CreateForm