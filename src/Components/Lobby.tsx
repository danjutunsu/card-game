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
  category: string;
}

const MenuButton = (props: { lobbyId: string | undefined, userId: string, socket: WebSocket}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const lobbyId = params.lobbyId;
  const randomId = uuidv4();
  const [username, setUserName] = useState('')
  const userId = useSelector((state: AppState) => state.userId);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    getUname(userId)
  }, [0])

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
      await axios.put(`${url}/lobby/leave`, {
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
      await axios.delete(`${url}/lobby?userId=${userId}`);
      navigate('/')
    } catch (error) {
      console.error(error);
    }
  };

  function toPascalCase(str: string): string {
    return str.replace(/(\w)(\w*)/g, function(_, firstChar, rest) {
      return firstChar.toUpperCase() + rest.toLowerCase();
    });
  }

  async function getUname(id: string) {
    try {
      const response = await axios.get(`${url}/username`, {
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

  return (
    <div className="menu-container">
      <button className="menu-button" onClick={toggleMenu}>Menu</button>
      {menuVisible && (
        <><div className="user-info">
          <span>
            <p className="menu-username">{toPascalCase(username)}</p>
          </span>
        </div>
        <div className="menu">
          <button id="copy" className="menu-li-button" onClick={() => handleCopyLobby(props.lobbyId)}>Copy Lobby</button>
          <button id="leave" className="menu-li-button" onClick={() => handleLeaveGame(props.userId, lobbyId)}>Leave Game</button>
          <button id="logout" className="menu-li-button" onClick={() => handleLogout(props.userId)}>Logout</button>
          </div>
        </>
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
  const navigate = useNavigate();
  const [status, setStatus] = useState('')
  const [gameStatus, setGameStatus] = useState()
  const [userIdList, setUserIdList] = useState([])
  const gameId = useSelector((state: AppState) => state.gameId);
  const [turn, setTurn] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const dispatch = useDispatch();
  const [invited, setInvited] = useState(true)
  const params = useParams();
  const lobbyId = params.lobbyId;
  const [inviteeUsername, setInviteeUsername] = useState('Enter Username');
  const [selectedGenre, setSelectedGenre] = useState('')
  const [player1, setPlayer1] = useState('')
  const categories = ["Movies & Television", "Literature", "Food & Drink", "Music", "Pop Culture", "Relationships", "Science & Technology", "World Travel"];
  const [selectedCategory, setSelectedCategory] = useState('');
  // const [ip, setIp] = useState('127.0.0.1')

  //create new socket
  const socket = new WebSocket(`ws://triviafriends.herokuapp.com?userId=${userId}`);

  // getIp();

  // useEffect(() => {
  //   //create new socket
  //   const ipv4Address = ip.replace(/^::ffff:/, '');
  // const socket = new WebSocket(`ws://${ipv4Address}:3002?userId=${userId}`)

  // }, [ip])

  if (lobbyId) {
    dispatch({ type: 'SET_UUID', payload: lobbyId });
    localStorage.setItem('uuid', lobbyId);
  }

  if (lobbyId) {
    axios.put(`${url}/lobby/${lobbyId}`, {
      userId: userId
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });
  }

  // Event: Connection opened
  socket.addEventListener('open', (event) => {
    setStatus('Idle')
  });

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
      setInvited(true)
    } else if (data.logout) {
      // const { sender, recipient } = data.invite;
      fetchUsers(params.lobbyId);
    } else if (data.leave) {
      // const { sender, recipient } = data.invite;
      fetchUsers(params.lobbyId);
    } else if (data.invitee) {
      // const { sender, recipient } = data.invite;
      console.log(`INVITED`)
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

  async function getIp() {
    try {
      const response = await axios.get(`${url}/ip`);
      const data = response.data;
      // setIp(data)
      console.log(`IP: ${data}`)
    } catch (error) {
      console.error(error);
    }
  }

  const getGameStatus = async () => 
  {
    fetchUsers(params.lobbyId);
    console.log("EXECUTING_")
    
    if (userId && userId2) {
      const response = await axios.get(`${url}/games/status`, {
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
  }

  // useEffect(() => {
  //   getPlayer1(userId, userId2)
  //   console.log(`UserID:${userId}`)
  //   console.log(`UserID2:${userId2}`)
  // }, [users])

  const fetchUsers = async (uuid: string | undefined) => {
    try {
      const response = await axios.get(`${url}/lobby`, {
        params: {
          uuid: uuid
        }
      });
      setUsers(response.data.users);
      const usersList = response.data.users
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
    console.log(`HERE`)

    try {
      const response = await axios.get(`${url}/questions/genres`);
      setGenres(response.data);
      console.log('genres:')
      genres.forEach(element => {
        console.log(element.genre)
      })
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch genres based on selectedCategory
    const fetchGenres = async () => {
      console.log(`OR HERE`)
      try {
        const response = await axios.get(`${url}/questions/genres`);
        setGenres(response.data);
        console.log('genres:')
        genres.forEach(element => {
          console.log(element.genre)
        })
      } catch (error) {
        console.error(error);
      }
    };

    fetchGenres();
  }, [selectedCategory]);

  const fetchPlayer1 = async (game_id: number) => {
    if (gameId) {
      try {
        const response = await axios.get(`${url}/games/player1`, {
          params: {
            game_id: game_id
          }
        });
        console.log(`PLAYER1: ${response.data[0].player1_id}`);
        setPlayer1(response.data[0].player1_id);
      } catch (error) {
        console.error(error);
      }
    }
  };
  

  const [allUsersReady, setAllUsersReady] = useState(false);

  async function getGame(player1: string, player2: string) {
    try {
      const response = await axios.get(`${url}/games/id`, {
        params: {
          player1: player1,
          player2: player2
        }
      });
  
      if (!response.data.id) {
        // Game ID doesn't exist, insert a new row
        await axios.post(`${url}/games`, {
          player1: player1,
          player2: player2
        });
      }
  
      console.log(`Player1: ${player1} Player2: ${player2}`);
      console.log('data: ' + response.data.id);
      
      dispatch({ type: 'SET_GAMEID', payload: gameId });
      localStorage.setItem('gameId', gameId.toString());
  
      // Get the turn ID for current round
      await getTurn(gameId);
      await getGenre(userId, userId2);
      console.log(`USERID: ${userId} TURN: ${turn} GENRE: ${genre}`)
      if (allUsersReady && turn.toString() === userId.toString()) {
        // TODO - Make this handleUserStatus method work to change 
        // Status to In Progress
            // handleUserStatusUpdate(userId.toString(), "In Progress")
            // Status button clicked
            inProgress(userId)
            socket.send(JSON.stringify({
              type: 'user_status_update',
              payload: {
                userId: userId,
                status: "In Progress"
              }
            }));
            navigate('/card')
        } else {
            // navigate('/waiting')
            setWaiting(true)
        }
    } catch (err) {
      console.log(err);
      console.log("Error getting Game ID");
    }
  }

  async function inProgress(userId: string) {
    setStatus('In Progress');
    try {
      const response = await axios.put(`${url}/lobby/inprogress`, null, {
        params: {
          userId: userId
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function getGameID(player1: string, player2: string) {
    if (player1 && player2) {
      try {
        const response = await axios.get(`${url}/games/id`, {
          params: {
            player1: player1,
            player2: player2
          }
        });
    
        if (!response.data.id) {
          // Game ID doesn't exist, insert a new row
          await axios.post(`${url}/games`, {
            player1: player1,
            player2: player2
          });
        }
    
        console.log(`Player1: ${player1} Player2: ${player2}`);
        console.log('data: ' + response.data.id);
        
        dispatch({ type: 'SET_GAMEID', payload: response.data.id });
        localStorage.setItem('gameId', response.data.id);
      } catch (err) {
        console.log(err);
        console.log("Error getting Game ID");
      }
    }
  }
  
  async function getTurn(gameId: number) {
    if (gameId) {
      try {
          const response = await axios.get(`${url}/games/turn`, {
          params: {
            gameId: gameId
          }
        });
        setTurn(response.data.turn_id);
        
      } catch (err) {
        console.log(err);
        console.log("Error getting turn ID");
      }
    }
  }

  async function getGenre(player1: string, player2: string) {
    try {
        const response = await axios.get(`${url}/games/genre`, {
        params: {
          player1: player1,
          player2: player2
        }
      });
      setGenre(response.data.game_genre);
    } catch (err) {
      console.log(err);
      console.log("Error getting turn ID");
    }
  }

  async function handleStartGame(readyCheck: boolean, user: string, player1: string, player2: string): Promise<void> {
      await getGame(userId, userId2)
  }
  
  useEffect(() => {
    getGameID(userId, userId2)
    getGameStatus();
  }, [allUsersReady])

  useEffect(() => {
    fetchGenres();
    fetchPlayer1(gameId);
    getTurn(gameId)
    console.log(`GETTING TURN WITH GAMEID: ${gameId}`)
    getGameStatus();
    console.log(`Game Status: ${gameStatus}`)
    fetchUsers(lobbyId)
    }, [status]); 

  useEffect(() => {
    getTurn(gameId)
  }, [users])

  const handleReady = async (id: string) => {
    try {
      const response = await axios.put(`${url}/lobby?userId=${id}`);
      const updatedUser = response.data; // Get updated user object with new status
      if (updatedUser.status === 'Ready') {
        try {
          socket.send(JSON.stringify({
            type: 'user_status_update',
            payload: {
              userId: userId,
              status: "Ready"
            }
          }));

          setStatus('Idle');
          await axios.put(`${url}/lobby`); // Update status of all users
          const response = await axios.get(`${url}/lobby`);
          // setUsers(response.data.users);
          setAllUsersReady(response.data.allUsersReady); // Update flag based on response
          users.forEach((element: any) => {
            console.log(`${element.username} status: ${element.status}`)
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        socket.send(JSON.stringify({
          type: 'user_status_update',
          payload: {
            userId: userId,
            status: "Idle"
          }
        }));
        users.forEach((element: any) => {
          console.log(`${element.username} status: ${element.status}`)
        });

        setStatus('Ready');
        const allReady = users.every(user => user.status === 'Ready');
        setAllUsersReady(allReady); // Update flag based on current state of users
      }
    
      // // Status button clicked
      // socket.send(JSON.stringify({
      //   type: 'user_status_update',
      //   payload: {
      //     userId: userId,
      //     status: status
      //   }
      // }));
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

  interface UserListProps {
    users: User[];
    handleReady: (id: string) => Promise<void>;
    handleStatusUpdate: (user_id: string, newStatus: string) => void;
  }

  function toPascalCase(str: string): string {
    return str.replace(/(\w)(\w*)/g, function(_, firstChar, rest) {
      return firstChar.toUpperCase() + rest.toLowerCase();
    });
  }

  const handleInviteUser = async (username: string) => {
    if (users.length < 2) {
      try {
        const response = await axios.get(`${url}/users/invite`, {
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

  function CategoryList() {  
    return (
      <>
        {selectedCategory === '' ? (
          <>
            <h2 className="lobby-header lobby-stroke">Categories:</h2>
            <div className="genre-grid">
              {categories.map((category) => (
                <div
                  // className="genre-item"
                  key={category}
                  onClick={() => { 
                    setSelectedCategory(category); 
                    console.log(`CATEGORY: ${category}`)
                    console.log(`SELECTEDCATEGORY: ${selectedCategory}`)
                
                }}
                >
                  <button className="unselected">{category}</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="lobby-column">
            <h2 className="lobby-header lobby-stroke">{selectedCategory}:</h2>
            <button className="unselected" onClick={() => {setSelectedCategory('')}}>⮌ BACK</button>
          </div>
        )}
      </>
    );
  }

  function GenreList() {
    const [selectedGenres, setSelectedGenres] = useState<{[key: string]: boolean}>({});

    const handleGenreClick = async (genreId: string, genre: string) => {
      console.log(`SETTING GENRE IN METHOD`)
      setSelectedGenres(({}))
      setSelectedGenres((prevState) => ({
        ...prevState,
        [genreId]: !prevState[genreId],
      }));

      try {
        const response = await axios.put(`${url}/games/genre`, {
          player1: userId,
          player2: userId2,
          genre: genre
        });
      } catch (err) {
        console.log(err)
        console.log(`Error updating the genre`)
      }
      socket.onopen = () => {
        console.log(`SETTING GENRE IN WS`)
        const message = {
          payload: {
            message: 'set genre',
            genre: genre,
          },
        };
        socket.send(JSON.stringify(message));
      }
    };
    return (
      <div>
        {Array.isArray(genres) &&
          genres.map((genre) => (
            genre.category.replaceAll('_', ' ') === selectedCategory ? (
              <div
                key={genre.id}
                className={`genre-item ${selectedGenre === genre.genre ? 'selected' : 'unselected'}`}
                onClick={() => {
                  handleGenreClick(genre.id.toString(), genre.genre);
                  setSelectedGenre(genre.genre);
                }}
              >
                {genre.genre.replaceAll('_', ' ')}
              </div>
            ) : 
            <>
            </>
          ))}
      </div>
    );    
  }    

  function UserList(props: UserListProps) {
    return (
      <ul>
        {Array.isArray(users) && users.map((user) => (
          <li key={user.user_id} className="lobby-row" style={{listStyle: 'none'}}>
            {toPascalCase(user.username)} 
            <div className={`${user.status === 'Ready' ? 'ready' : 'idle'}`}>{user.status}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="lobby-container">
      <MenuButton lobbyId={lobbyId} userId={userId} socket={socket} />
      {users.length < 2 ? (
      <div className="search-container">
        <input className="search-form" type="text" value={inviteeUsername} onClick={() => setInviteeUsername('')} onChange={(e) => setInviteeUsername(e.target.value)} />
        <button disabled={users.length >=2} id="leave" className="invite-button" onClick={() => handleInviteUser(inviteeUsername)}>Invite User</button>
      </div>
      ) : null}
      <h3 className="lobby-header lobby-stroke">Users In Lobby:</h3>
      <UserList users={users} handleReady={handleReady} handleStatusUpdate={handleUserStatusUpdate}/>
      <button className="ready-button" onClick={() => handleReady(userId)}>Ready?</button>
      <CategoryList />
      {waiting ? <div><h1 className="lobby-header lobby-stroke">Your turn is next</h1></div> : <></>}
      <GenreList />
      <button disabled={!allUsersReady || users.length < 2} className="start-button" onClick={() => handleStartGame(allUsersReady, userId, users[0].user_id, users[1].user_id)}>Start Game</button>
    </div>
  );
};

export default Lobby;
