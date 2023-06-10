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
  const [users, setUsers] = useState<User[]>([]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    fetchUsers(lobbyId);
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

  const fetchUsers = async (uuid: string | undefined) => {
    try {
      const response = await axios.get(`${url}/lobby`, {
        params: {
          uuid: uuid
        }
      });
      setUsers(response.data.users);
      const usersList = response.data.users
      usersList.forEach((element: { user_id: string; }) => {
        console.log(element)
        if (element.user_id !== userId) {
          localStorage.setItem('userId2', element.user_id);
        }
      })      
    } catch (error) {
      console.error(error);
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
      fetchUsers(lobbyId);
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
  const [username, setUserName] = useState('')
  const [invited, setInvited] = useState(true)
  const params = useParams();
  const lobbyId = params.lobbyId;
  const [inviteeUsername, setInviteeUsername] = useState('Enter Username');
  const [selectedGenre, setSelectedGenre] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player1Uname, setPlayer1Uname] = useState('')
  const categories = ["Movies & Television", "Literature", "Food & Drink", "Music", "Pop Culture", "Relationships", "Science & Technology", "World Travel"];
  const [selectedCategory, setSelectedCategory] = useState('');
  // const [ip, setIp] = useState('127.0.0.1')

  useEffect(() => {
    console.log(`Current State of Genre: ${genre}`)
  }, [genre])

  //create new socket
  let socketUrl;

  if (process.env.NODE_ENV === "development") {
    // Set local WebSocket URL
    socketUrl = `ws://10.0.0.197:3001/?userId=${userId}`;
  } else {
    // Set production WebSocket URL
    socketUrl = `wss://triviafriendsserver.onrender.com/?userId=${userId}`;
  }
  const socket = new WebSocket(socketUrl);

  // getIp();

  // useEffect(() => {
  //   //create new socket
  //   const ipv4Address = ip.replace(/^::ffff:/, '');
  // const socket = new WebSocket(`ws://${ipv4Address}:3002?userId=${userId}`)

  // }, [ip])

  async function getUname(id: string) {
    try {
      const response = await axios.get(`${url}/username`, {
        params: {
          userId: id
        },
      });
      
      setPlayer1Uname(response.data.rows[0].username)
    } catch (error) {
      console.error(error);
    }
  }

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

  // // Listen for messages
  socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data)
    if (event.data === 'pong') {
      console.log('Received pong from server.'); // Server responded to our 'ping'
    } else {
      console.log('Received message from server:', event.data);
    } 

    if (data.user_status_update) {
      console.log(`USER STATUS UPDATED`)
      const { userId, status} = data.user_status_update;
      handleUserStatusUpdate(data.user_status_update.userId, data.user_status_update.status);
      fetchUsers(lobbyId);
    } else if (data.end_game) {
      navigate(`/stats`)
    } else if (data.genreToSet) {
      let genre = data.genreToSet.genre
      setSelectedGenre(genre.replaceAll('_', ' '))
      console.log(`WORKING HERE`)
      console.log(`SETTING GENRE TO ${data.genreToSet.genre.replaceAll('_', ' ')}`)
      setGenre(data.genreToSet.genre)
      dispatch({ type: 'SET_GENRE', payload: data.genreToSet.genre });
      localStorage.setItem('genre', genre);
      setGenreDB(userId, userId2, data.genreToSet.genre)
    } else if (data.invite) {
      setInvited(true)
      fetchUsers(uuid);
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
        // Status button clicked
        socket.send(JSON.stringify({
          type: 'refresh',
          payload: {
            user1: userId,
            user2: data.invitee.sender
          }
        }));
        fetchUsers(uuid)
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
      fetchUsers(uuid);
    }
  });

  // Connection closed
  socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed');
  });
  
  async function setGenreDB(player1: string, player2: string, selectedGenre: string) {
    try {
      const response = axios.put(`${url}/games/genre`, {
        player1: userId,
        player2: userId2,
        selectedGenre: selectedGenre
      });
    } catch (err) {
      console.log(err)
      console.log(`Error updating the genre`)
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

    getUname(player1)

    fetchGenres();
  }, [selectedCategory, player1]);

  useEffect(() => {
    console.log(`getting genre for user: ${userId} and user: ${userId2}`)
    getGenre(userId, userId2);
  }, [selectedGenre])

  const fetchPlayer1 = async (game_id: number) => {
    if (gameId) {
      try {
        const response = await axios.get(`${url}/games/player1`, {
          params: {
            game_id: game_id
          }
        });
        console.log(`PLAYER1: ${response.data.player1_id}`);
        setPlayer1(response.data.player1_id);
        console.log(`PLAYER 1 UPDATED`)
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

  async function idle(userId: string) {
    setStatus('Idle');
    try {
      const response = await axios.put(`${url}/lobby/idle`, null, {
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
      setGenre(response.data.replaceAll('_', ' '));
      console.log(`CURRENT GAME GENRE: ${response.data}`)
      let genre = response.data.replaceAll('_', ' ');
      setSelectedGenre(genre.replaceAll('_', ' '))
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
    users.forEach(element => {
      if (element.user_id === userId && element.status === "In Progress") {
          console.log(`TRUE`)
          idle(userId)
        } else {
          console.log(`false: ${status}`)
        }
    })
  }, [users])

  useEffect(() => {
    getTurn(gameId)
  }, [users])

  useEffect(() => {
    socket.onopen = () => {
      socket.send(JSON.stringify({
      type: 'refresh',
      payload: {
        user1: userId,
        user2: userId2
      }
      }));
    }
  }, [0])

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
          socket.onopen = () => {
          socket.send(JSON.stringify({
          type: 'refresh',
          payload: {
            user1: userId,
            user2: userId2
          }
          }));
        }
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
        socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'refresh',
          payload: {
            user1: userId,
            user2: userId2
          }
        }));
      }
        users.forEach((element: any) => {
          console.log(`${element.username} status: ${element.status}`)
        });

        setStatus('Ready');
        const allReady = users.every(user => user.status === 'Ready');
        setAllUsersReady(allReady); // Update flag based on current state of users
      }
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
      console.log(`SETTING GENRE IN WS`)
      socket.send(JSON.stringify({
        type: 'set_genre',
        payload: {
          type: "set_genre",
          genre: genre
        }
      }));
    };
    return (
      <div>
        {Array.isArray(genres) &&
          genres.map((genre) =>
            genre.category.replaceAll('_', ' ') === selectedCategory.toString() ? (
              <div
                key={genre.id} // Add the key prop with a unique identifier
                className={`genre-item ${selectedGenre === genre.genre ? 'selected' : 'unselected'}`}
                onClick={() => {
                  console.log(`SELECTED ${genre.genre}`);
                  handleGenreClick(genre.id.toString(), genre.genre);
                  setSelectedGenre(genre.genre.replaceAll('_', ' '));
                  socket.onopen = () => {
                    console.log(`SETTING GENRE IN WS`)
                    const message = {
                      payload: {
                        type: 'set_genre',
                        genre: genre,
                      },
                    };
                    socket.send(JSON.stringify(message));
                  }
                }}
              >
                {genre.genre.replaceAll('_', ' ')}
              </div>
            ) : null
          )}
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
      <div><h1 className="lobby-header lobby-stroke">{player1Uname } has set the genre to <span className="lobby-genre">{genre}</span></h1></div>
      {waiting ? <div><h1 className="lobby-header lobby-stroke">Your turn is next</h1></div> : <></>}
      {userId.toString() === player1.toString() || users.length === 1 ? (
      <><CategoryList /><GenreList /></>
      ) : (
        <></>
      )}
      <button disabled={!allUsersReady || users.length < 2} className="start-button" onClick={() => handleStartGame(allUsersReady, userId, users[0].user_id, users[1].user_id)}>Start Game</button>
    </div>
  );
};

export default Lobby;
