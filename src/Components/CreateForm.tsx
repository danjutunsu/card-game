import { useEffect, useState } from "react";
import bcrypt from "bcryptjs"; 
import axios from "axios";
import { url } from "../Config";

interface CreateFormProps {
    onLogin: (username: string, password: string) => void;
  }
  
  const CreateForm: React.FC<CreateFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('swag');
  
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
  
          const response = await axios.post(`${url}/api/users`, {
            userId: uid,
            userName: uName,
            password: hashedPassword // send the hashed password to the backend
          });
  
        } catch (error) {
          console.error(error);
        }
      }

    return (
      <form onSubmit={handleSubmit}>
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
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <br />
        <label>
          Confirm Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  };
  
  export default CreateForm