import axios from "axios";
import { useEffect, useState } from "react";
import { url } from "../Config";
import { useSelector } from "react-redux";
import { AppState } from "../store";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  status: string;
}

const Lobby = () => {
  const [users, setUsers] = useState<User[]>([]);
  const userId = useSelector((state: AppState) => state.userId);
  const [username, setUserName] = useState()
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get(`${url}/api/lobby`);
      const data = response.data;
      setUsers(data);
      getUname(userId)
    };    
    fetchUsers();
  }, [users]);  

  const handleReady = () => {
    console.log("READY")
  }

  function UserList() {
    return (
      <ul>
        {Array.isArray(users) && users.map((user) => (
          <li key={user.id} className="lobby-row" style={{listStyle: 'none'}}>
            <div className="lobby-column lobby-column-stroke"> {toPascalCase(user.username)} </div>
            <div className="lobby-column lobby-column-stroke"> {user.status} </div>
            <div className="lobby-column"> <button className="ready-button" onClick={handleReady}>Ready</button> </div>
          </li>
        ))}
      </ul>
    );
  }
  
  
  function toPascalCase(str: string): string {
    return str.replace(/(\w)(\w*)/g, function(_, firstChar, rest) {
      return firstChar.toUpperCase() + rest.toLowerCase();
    });
  }

  async function getUname(id: string) {
    try {
      const response = await axios.get(`${url}/api/username`, {
        params: {
          userId: id
        },
      });
      
      setUserName(response.data.rows[0].username)
    //   console.log(`User Data: ${response.data.userId}`); // handle the response from the backend
    } catch (error) {
      console.error(error);
    }
  }

  const handleLogout = async (userId: string) => {
    try {
        await axios.delete(`${url}/api/lobby?userId=${userId}`);
        navigate('/')
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="stats-page">
    <button className="logout-button" onClick={() => handleLogout(userId)}>Logout</button>
    <p className="stats-header">Logged In As: {username}</p>
    <p className="stats-header">Users In Lobby:</p>
    <UserList />
    <p className="stats-row"></p>
    <p className="stats-header"></p>
    <button className="button" onClick={() => {navigate('/card')}}>Start Game</button>
    <p className="stats-row"></p>
    </div>
  );
};

export default Lobby;
