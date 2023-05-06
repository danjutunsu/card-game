import axios from "axios";
import { useEffect, useState } from "react";
import { url } from "../Config";
import { useSelector } from "react-redux";
import { AppState } from "../store";
import { useNavigate } from "react-router-dom";

interface User {
  user_id: string;
  username: string;
  status: string;
}

const Lobby = () => {
  const [users, setUsers] = useState<User[]>([]);
  const userId = useSelector((state: AppState) => state.userId);
  const [username, setUserName] = useState('')
  const navigate = useNavigate();
  const [status, setStatus] = useState('')
  const [userIdList, setUserIdList] = useState([])
  //create random user to the game db and save

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}/api/lobby`);
      setUsers(response.data.users);
      getUname(userId)
      console.log('userid: ' + userId)
      setAllUsersReady(response.data.allUsersReady); // Set flag based on response
      console.log(`Ready? ${allUsersReady}`)
    } catch (error) {
      console.error(error);
    }
  };

const [allUsersReady, setAllUsersReady] = useState(false);

async function handleStartGame(readyCheck: boolean, user: string, player1: string, player2: string): Promise<void> {
    console.log(`Player 1: ${player1} - Player 2: ${player2}`)
    
    if (readyCheck && user.toString() === '2') {
        try {
            const response = await axios.get(`${url}/api/games/id`, {
                params: {
                    player1: player1,
                    player2: player2
                }
            })
        }
        catch (err) {
            console.log(err)
        }        
        navigate('/card')
    } else {
        console.log(allUsersReady)
        console.log(userId)
        navigate('/waiting')
    }
}

useEffect(() => {
    fetchUsers();
  }, [status]); 
  
//   useEffect(() => {
//     if (allUsersReady) {
//         navigate('/card')
//     }
//   }, [allUsersReady]); 

const handleReady = async (id: string) => {
    try {
      const response = await axios.put(`${url}/api/lobby?userId=${id}`);
      const updatedUser = response.data; // Get updated user object with new status
      if (updatedUser.status === 'Ready') {
        try {
          setStatus('Idle');
          console.log("status change");
          await axios.put(`${url}/api/lobby`); // Update status of all users
          const response = await axios.get(`${url}/api/lobby`);
          setUsers(response.data.users);
          setAllUsersReady(response.data.allUsersReady); // Update flag based on response
          console.log("Status of users in lobby:")
          users.forEach((element: any) => {
            console.log(`${element.username} status: ${element.status}`)
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("Status of users in lobby:")
        users.forEach((element: any) => {
          console.log(`${element.username} status: ${element.status}`)
        });
        setStatus('Ready');
        console.log("status change");
        const allReady = users.every(user => user.status === 'Ready');
        setAllUsersReady(allReady); // Update flag based on current state of users
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  
  function UserList() {
    return (
      <ul>
        {Array.isArray(users) && users.map((user) => (
          <li key={user.user_id} className="lobby-row" style={{listStyle: 'none'}}>
            <div className="lobby-column lobby-column-stroke"> {toPascalCase(user.username)} </div>
            <div className="lobby-column lobby-column-stroke"> {user.status} </div>
            <div className="lobby-column"> 
              <button className="ready-button" onClick={() => handleReady(user.user_id)}>Ready?</button> 
            </div>
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
      <button id="logout" className="logout-button" onClick={() => handleLogout(userId)}>Logout</button>
      <div className="user-info">
      <span>
    <p className="stats-header">Logged In As: </p>
    <p className="lobby-username">{toPascalCase(username)}</p>
    </span>
      </div>
      <p className="stats-header">Users In Lobby:</p>
      <UserList />
      <p className="stats-row"></p>
      {/* <p className="stats-header"></p> */}
      <button disabled={!allUsersReady} className="button" onClick={() => handleStartGame(allUsersReady, userId, users[0].user_id, users[1].user_id)}>Start Game</button>
      <p className="stats-row"></p>
    </div>
  );
  
};

export default Lobby;
