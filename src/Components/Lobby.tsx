import axios from "axios";
import { SetStateAction, useEffect, useState } from "react";
import { url } from "../Config";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../store";
import { useNavigate, useParams } from "react-router-dom";
import {v4 as uuidv4} from 'uuid';

interface Lobby {
  lobbyId: string
}

interface User {
  user_id: string;
  username: string;
  status: string;
}

interface Genre {
  id: number;
  genre: string;
}

const MenuButton = (props: { lobbyId: string | undefined, userId: string, socket: WebSocket}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const lobbyId = params.lobbyId;
  const randomId = uuidv4();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCopyLobby = (uuid: string | undefined) => {
    if (uuid) {
      const url = window.location.origin; // Get the current URL
      const fullUUID = `${url}/lobby/${uuid}`; // Concatenate the URL and UUID
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullUUID)
          .then(() => {
            console.log('Text copied to clipboard:', fullUUID);
            // You can show a success message or perform any other actions here
          })
          .catch((error) => {
            console.error('Error copying text to clipboard:', error);
            // You can show an error message or handle the error in any desired way
          });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullUUID;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Text copied to clipboard:', fullUUID);
        // You can show a success message or perform any other actions here
      }
    }
  };

  const handleLeaveGame = async (userId: string, uuid: string | undefined) => {
    try {
      const message = { payload: 'leave' };
      props.socket.send(JSON.stringify(message));
      await axios.put(`${url}/api/lobby/leave`, {
          userId: userId,
          uuid: uuid
      });
      navigate(`/lobby/${randomId}`)
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async (userId: string) => {
    try {
      const message = { payload: 'logout' };
      props.socket.send(JSON.stringify(message));
      await axios.delete(`${url}/api/lobby?userId=${userId}`);
      navigate('/')
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="menu-container">
      <button className="menu-button" onClick={toggleMenu}>Menu</button>
      {menuVisible && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <button id="copy" className="menu-li-button" onClick={() => handleCopyLobby(props.lobbyId)}>Copy Lobby</button>
          </li>
          <li>
            <button id="leave" className="menu-li-button" onClick={() => handleLeaveGame(props.userId, lobbyId)}>Leave Game</button>
          </li>
          <li>
            <button id="logout" className="menu-li-button" onClick={() => handleLogout(props.userId)}>Logout</button>
          </li>
        </ul>
      )}
    </div>
  );
};

const Lobby = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState<Genre[]>([]);
  const userId = useSelector((state: AppState) => state.userId);
  const userId2 = useSelector((state: AppState) => state.userId2);
  const uuid = useSelector((state: AppState) => state.uuid);
  const [username, setUserName] = useState('')
  const navigate = useNavigate();
  const [status, setStatus] = useState('')
  const [gameStatus, setGameStatus] = useState()
  const [userIdList, setUserIdList] = useState([])
  const [gameId, setGameId] = useState(0)
  const [turn, setTurn] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const dispatch = useDispatch();
  const [player1, setPlayer1] = useState('')
  const [invited, setInvited] = useState(true)
  const [accepted, setAccepted] = useState(true)
  const params = useParams();
  const lobbyId = params.lobbyId;
  const [inviteeUsername, setInviteeUsername] = useState('Enter Username');

  //create new socket
  const socket = new WebSocket(`ws://10.0.0.197:3002?userId=${userId}`)
  
  if (lobbyId) {
    dispatch({ type: 'SET_UUID', payload: lobbyId });
    localStorage.setItem('uuid', lobbyId);
  }

  axios.put(`${url}/api/lobby/${lobbyId}`, {
    userId: userId
  })
  .then(response => {
    // Handle the response data
    console.log(response.data);
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });

  socket.onopen = function (event) {
    console.log(`user connected`)
    console.log(`Lobby ID: ${params.lobbyId}`)
    // fetchUsers()
  };

  // // Listen for messages
  socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data)
    if (data.user_status_update) {
      const { userId, status} = data.user_status_update;
      handleUserStatusUpdate(data.user_status_update.userId, data.user_status_update.status);
    }
    else if (data.end_game) {
      navigate(`/stats`)
    } else if (data.genreToSet) {
      console.log(`SETTING GENRE TO ${data.genreToSet}`)
      setGenre(data.genreToSet)
      dispatch({ type: 'SET_GENRE', payload: data.genreToSet });
      localStorage.setItem('genre', genre);
    } else if (data.invite) {
      // const { sender, recipient } = data.invite;
      // alert(`${data.invite.sender} is inviting you to join their game.`)
      setInvited(true)
      
      console.log(`user ${data.invite.sender} invited user ${data.invite.recipient} to join the game`)

    } else if (data.logout) {
      // const { sender, recipient } = data.invite;
      fetchUsers(params.lobbyId);
    } else if (data.leave) {
      // const { sender, recipient } = data.invite;
      fetchUsers(params.lobbyId);
    } else if (data.invitee) {
      // const { sender, recipient } = data.invite;
      console.log(`INVITED`)
      // alert('sheeeit')
      // console.log(data.invitee.lobbyId)
      const result = window.confirm(`Invited to join a game`)
      if (result) {
        navigate(`/lobby/${data.invitee.lobbyId}`)
        fetchUsers(params.lobbyId)
        // Status button clicked
        socket.send(JSON.stringify({
          type: 'refresh',
          payload: {
            user1: userId,
            user2: data.invitee.sender
          }
        }));
      } else {
        // Status button clicked
        socket.send(JSON.stringify({
          type: 'user_rejected',
          payload: {
            reject: userId,
            request: data.invitee.sender
          }
        }));
      }
    } else if (data.user_rejected) {
      // const { sender, recipient } = data.invite;
      alert(`USER ${data.user_rejected.reject} rejected the invitation`)
      fetchUsers(params.lobbyId);
    } else if (data.refresh) {
      // const { sender, recipient } = data.invite;
      console.log(`REFRESH`)
      fetchUsers(params.lobbyId);
    }
  });

  // Connection closed
  socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed');
  });

//   useEffect(() => {
//   async function fetchPlayer1() {
//     const p1 = await getPlayer1(userId, userId2);

//     setPlayer1(p1);
//   }
//   fetchPlayer1();
// }, [userId, users]);

  const getGameStatus = async () => 
  {
    fetchUsers(params.lobbyId);
    console.log("EXECUTING-_______________")
    
    const response = await axios.get(`${url}/api/games/status`, {
      params: {
        player1: userId,
        player2: userId2
      }
    })
    const jsonData = await response.data.game_status;
    
    setGameStatus(jsonData)
    if (jsonData === "0") {
      // console.log("ANSWERING")
    }
    return jsonData;
  }

  useEffect(() => {
    getPlayer1(userId, userId2)
    console.log(`UserID:${userId}`)
    console.log(`UserID2:${userId2}`)
  }, [users])

  const fetchUsers = async (uuid: string | undefined) => {
    try {
      const response = await axios.get(`${url}/api/lobby`, {
        params: {
          uuid: uuid
        }
      });
      setUsers(response.data.users);
      const usersList = response.data.users
      getUname(userId)
      console.log("USERS:")
      usersList.forEach((element: { user_id: string; }) => {
        console.log(element)
        if (element.user_id !== userId) {
          console.log("SETTING NEW USER")
          dispatch({ type: 'SET_USER_ID_2', payload: element.user_id});
          localStorage.setItem('userId2', element.user_id);
        }
      })      
      setAllUsersReady(response.data.allUsersReady); // Set flag based on response
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${url}/api/questions/genres`);
      setGenres(response.data);
      console.log('genres:')
      genres.forEach(element => {
        console.log(element.genre)
      })
    } catch (error) {
      console.error(error);
    }
  };

  const [allUsersReady, setAllUsersReady] = useState(false);

  async function getGame(player1: string, player2: string) {
    try {
        const response = await axios.get(`${url}/api/games/id`, {
            params: {
                player1: player1,
                player2: player2
            }
        })
        console.log(`Player1: ${player1} Player2: ${player2}`)
        console.log('data: ' + response.data.id)
        setGameId(response.data.id)
        
        // Get the turn id for current round
        getTurn(response.data.id)
    }
    catch (err) {
        console.log(err)
        console.log("Error getting Game ID")
    }   
  }

  async function getTurn(gameId: number) {
    try {
        const response = await axios.get(`${url}/api/games/turn`, {
        params: {
          gameId: gameId
        }
      });

      setTurn(response.data.turn_id);

      if (allUsersReady && response.data.turn_id === userId) {
        // TODO - Make this handleUserStatus method work to change 
        // Status to In Progress
            // handleUserStatusUpdate(userId.toString(), "In Progress")
            navigate('/card')
        } else {
            console.log(allUsersReady)
            console.log(userId)
            // navigate('/waiting')
            setWaiting(true)
        }
    } catch (err) {
      console.log(err);
      console.log("Error getting turn ID");
    }
  }

  async function handleStartGame(readyCheck: boolean, user: string, player1: string, player2: string): Promise<void> {
      await getGame(userId, userId2)
  }

  async function getPlayer1(player1: string, player2: string) {
    try {
      const response = await axios.get(`${url}/api/games/player1`, {
        params: {
          player1: player1,
          player2: player2
        }
      });
      console.log(`Player 1: ${response.data}`);
      setPlayer1(response.data.player1_id.toString)
      return response.data.player1_id
    } catch (err) {
      console.log(err);      
      console.log("Error retrieving player 1");
    }
  }
  
  // useEffect(() => {
  //   fetchUsers();
  // }, [0])

  useEffect(() => {
    getGameStatus();
    fetchGenres();
    // getPlayer1(userId, userId2);
    console.log(`Game Status: ${gameStatus}`)
    }, [status]); 

  useEffect(() => {
    console.log(users[1]?.user_id)
  }, [users])

  const handleReady = async (id: string) => {
    try {
      const response = await axios.put(`${url}/api/lobby?userId=${id}`);
      const updatedUser = response.data; // Get updated user object with new status
      if (updatedUser.status === 'Ready') {
        try {
          setStatus('Idle');
          await axios.put(`${url}/api/lobby`); // Update status of all users
          const response = await axios.get(`${url}/api/lobby`);
          // setUsers(response.data.users);
          setAllUsersReady(response.data.allUsersReady); // Update flag based on response
          users.forEach((element: any) => {
            console.log(`${element.username} status: ${element.status}`)
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        users.forEach((element: any) => {
          console.log(`${element.username} status: ${element.status}`)
        });
        setStatus('Ready');
        const allReady = users.every(user => user.status === 'Ready');
        setAllUsersReady(allReady); // Update flag based on current state of users
      }
    
      // Status button clicked
      socket.send(JSON.stringify({
        type: 'user_status_update',
        payload: {
          userId: userId,
          status: status
        }
      }));
    } catch (error) {
      console.error(error);
    }
  }

  const handleInvite = async (sender: string, recipient: string) => {
    if (sender !== recipient) {
      try {
        // Invite clicked
        socket.send(JSON.stringify({
          type: 'invite',
          payload: {
            sender: sender,
            recipient: recipient
          }
        }));
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleAccept = async (sender: string, recipient: string) => {
    if (!accepted) {
      setAccepted(true)
    } else {
      setAccepted(false)
    }

    if (sender !== recipient) {
      try {
        // Accept clicked
        socket.send(JSON.stringify({
          type: 'accept',
          payload: {
            sender: sender,
            recipient: recipient
          }
        }));
      } catch (error) {
        console.error(error);
      }
    }
  }


  interface UserListProps {
    users: User[];
    handleReady: (id: string) => Promise<void>;
    handleStatusUpdate: (user_id: string, newStatus: string) => void;
  }

  function GenreList() {
    const [selectedGenres, setSelectedGenres] = useState<{[key: string]: boolean}>({});

    const handleGenreClick = async (genreId: string, genre: string) => {
      setSelectedGenres((prevState) => ({
        ...prevState,
        [genreId]: !prevState[genreId],
      }));

      try {
        const response = await axios.put(`${url}/api/games/genre`, {
          player1: userId,
          player2: userId2,
          genre: genre
        });
      } catch (err) {
        console.log(err)
        console.log(`Error updating the genre`)
      }
  
      const message = {
        payload: {
          message: 'set genre',
          genre: genre,
        },
      };
      socket.send(JSON.stringify(message));
    };
  
    return (
      <>
        <div className="lobby-column lobby-column-stroke stats-header">
          Choose a genre:
        </div>
        <ul>
          {Array.isArray(genres) &&
            genres.map((genre) => (
              <li
                key={genre.id}
                className="lobby-row"
                style={{ listStyle: 'none' }}
              >
                <div className={`genre-column`}>
                  <button
                    className={`${selectedGenres[genre.id] ? 'selected' : 'button'}`}
                    onClick={() => handleGenreClick(genre.id.toString(), genre.genre)}
                  >
                    {genre.genre.replaceAll('_', ' ')}
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </>
    );
  }

  function UserList(props: UserListProps) {
    return (
      <ul>
        {Array.isArray(users) && users.map((user) => (
          <li key={user.user_id} className="lobby-row" style={{listStyle: 'none'}}>
            <div className="lobby-column lobby-column-stroke"> {toPascalCase(user.username)} 
            </div>
            {/* {user.user_id !== userId ? 
            <button className="invite-button" onClick={() => handleInvite(userId, user.user_id)}>Invite</button> : <></>} */}
            {user.user_id === userId /* && invited */ ? 
            <button className="button" onClick={() => handleAccept(userId, user.user_id)}>{accepted ? 'Accepted' : 'Accept?'}
            </button> : <></>}
            <div className={`lobby-column lobby-column-stroke ${user.status === 'Ready' ? 'ready' : 'idle'}`}>{user.status}</div>
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

  const handleInviteUser = async (username: string) => {
    if (users.length < 2) {
      try {
        const response = await axios.get(`${url}/api/users/invite`, {
          params: {
            username: username
          }
        });
        console.log(`USERNAME RESPONSE: ${response.data}`)
        
        // Invite sent
        socket.send(JSON.stringify({
          type: 'invitee',
          payload: {
            userId: response.data,
            lobbyId: lobbyId,
            sender: userId
          }
        }));
        // navigate('/')
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUserStatusUpdate = (user_id: string, status: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.user_id === user_id ? { ...user, status: status } : user
      )
    );
  };

  return (
    <div className="stats-page">
      <MenuButton lobbyId={lobbyId} userId={userId} socket={socket} />
      <div className="search-container">
        <input className="search-form" type="text" value={inviteeUsername} onClick={() => setInviteeUsername('')} onChange={(e) => setInviteeUsername(e.target.value)} />
        <button disabled={users.length >=2} id="leave" className="invite-button" onClick={() => handleInviteUser(inviteeUsername)}>Invite User</button>
      </div>
      <div className="user-info">
        <span>
          <p className="stats-header">Logged In As:</p>
          <p className="lobby-username">{toPascalCase(username)}</p>
        </span>
      </div>
      <p className="stats-header">Users In Lobby:</p>
      <UserList users={users} handleReady={handleReady} handleStatusUpdate={handleUserStatusUpdate}/>
      <button className="ready-button" onClick={() => handleReady(userId)}>Ready?</button> 
      <p className="stats-row"></p>
      <button disabled={!allUsersReady || users.length < 2 /* || !accepted */} className="button" onClick={() => handleStartGame(allUsersReady, userId, users[0].user_id, users[1].user_id)}>Start Game</button>
      {waiting && <div><h1 className="stats-header">Your turn is next</h1></div>}
      {gameStatus === 0 && userId.toString() === users[0].user_id.toString() ?  (
      <GenreList />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Lobby;
