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
  const userId2 = useSelector((state: AppState) => state.userId2);
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
      // props.socket.onopen = async () => {
      props.socket.send(JSON.stringify(message));
      await axios.put(`${url}/lobby/leave`, {
          userId: userId,
          uuid: uuid
      });
      // }
      navigate(`/lobby/${randomId}`)
      console.log(`random id: ${randomId}`)
      // props.socket.onopen = () => {
      props.socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
    // }
    } catch (error) {
      console.error(error);
      fetchUsers(params.lobbyId);
      props.socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
    }
  };

  const handleLogout = async (userId: string) => {
    
    props.socket.send(JSON.stringify({
      type: 'refresh',
      payload: {
        user1: userId,
        user2: userId2
      }
    }));
    try {
      const message = { payload: 'logout' };
      // props.socket.onopen = () => {
        props.socket.send(JSON.stringify(message));
      // }
      await axios.delete(`${url}/lobby?userId=${userId}`);
      fetchUsers(params.lobbyId);

      navigate('/')
      
      props.socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
    } catch (error) {
      console.error(error);
      
      props.socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
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
      {/* <span> */}
      <div className="container" onClick={toggleMenu}>
        <img className="user-icon" src ="icons8-user-60.png"></img>
        <span className="user-name" >{toPascalCase(username)}</span>
        <img className="menu-icon" src="icons8-menu-250.png" ></img>
      </div>
      {/* </span> */}
      {menuVisible && (
        <>
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
  const categories = ["Nature", "Life", "Movies & Television", "Literature", "Food & Drink", "Music", "Pop Culture", "Relationships", "Science & Technology", "World Travel", "Video Games"];
  const [selectedCategory, setSelectedCategory] = useState('');
  const token = localStorage.getItem('token');
  const [playerTurn, setPlayerTurn] = useState(0)
  const [player2Turn, setPlayer2Turn] = useState(0)
  const [allUsersReady, setAllUsersReady] = useState(false);
  const gameInProgress = useSelector((state: AppState) => state.gameInProgress);
  
  const refresh = () => {
    socket.send(JSON.stringify({
      type: 'refresh',
      payload: {
        user1: userId,
        user2: userId2
      }
    }));
  }

  // const body = document.querySelector('body');

  // function changeBodyBackgroundImage(imagePath: string) {
  //   document.body.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, .5),rgba(0, 0, 0, .5), rgba(0, 0, 0, 1)), url(${imagePath})`;
  //   document.body.style.backgroundSize = '100% 100vh, cover';
  //   document.body.style.backgroundRepeat = 'no-repeat, no-repeat';
  // }
  
  // // Call the function with the desired image path
  // const imagePath = `../${selectedGenre.replaceAll(" ", "_")}.jpg`;
  
  // useEffect(() => {
  //   if (selectedGenre === '') {
  //     changeBodyBackgroundImage(`../main.jpg`);
  //   } else {
  //     changeBodyBackgroundImage(imagePath);
  //     console.log(`genre is ${selectedGenre}`);
  //   }
  // }, [selectedGenre]);
  

  useEffect(() => {
    if (playerTurn === 2 && player2Turn === 2) {

      console.log(`SENDING TO STATS`)
      clear(parseInt(userId), gameId);
      clear(parseInt(userId2), gameId);
      handleEnd();
    }
  }, [playerTurn, player2Turn])

  async function clear(player: number, game_id: number) {
    try {      
      await axios.put(`${url}/games/player_turn`, {
        player: player,
        game_id: game_id
      })
    } catch (error) {
      console.error(error);
    }
  }  

  const getPlayerTurn = async (player: number, game_id: number) => 
  {
    // console.log("EXECUTING-_______________")
    console.log(player)
    const response = await axios.get(`${url}/games/player_turn`, {
      params: {
        player: player,
        game_id: game_id
      }
    })
    const jsonData = response.data;

    setPlayerTurn(jsonData.playerTurn)
    console.log(`SETTING PLAYER TURN TO: ${jsonData.playerTurn}`)
    // if (jsonData === 0) {
    //   socket.onopen = () => {
    //   // console.log('resetting')
    //   try {
    //     const message = { payload: 'reset' };
    //     socket.send(JSON.stringify(message));
    //   } catch (error) {
    //     console.error(error);
    //   }
    //   }
    // }
      return jsonData;
    }

  const getPlayer2Turn = async (player: number, game_id: number) => 
  {
  // console.log("EXECUTING-_______________")
  console.log(player)
  const response = await axios.get(`${url}/games/player_turn`, {
    params: {
      player: player,
      game_id: game_id
    }
  })
  const jsonData = response.data;

  setPlayer2Turn(jsonData.playerTurn)
  console.log(`SETTING PLAYER TURN TO: ${jsonData.playerTurn}`)
  // if (jsonData === 0) {
  //   socket.onopen = () => {
  //   // console.log('resetting')
  //   try {
  //     const message = { payload: 'reset' };
  //     socket.send(JSON.stringify(message));
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   }
  // }
    return jsonData;
  }


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

  async function getU2(id: string) {
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
  
  // Create a new socket
  let socketUrl;
  
  if (process.env.NODE_ENV === "development") {
    // Set local WebSocket URL
    
    // const currentUrl = window.location.href;
    // const uuidd = currentUrl.match(/\/lobby\/([^/]+)/)[1];
    socketUrl = `ws://10.0.0.197:3001/?userId=${userId}&uuid=${uuid}`; // Use & to separate query parameters
  } else {
    // Set production WebSocket URL
    socketUrl = `wss://triviafriendsserver.onrender.com/?userId=${userId}&uuid=${uuid}`;
  }
  
  const socket = new WebSocket(socketUrl);

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

  // // Listen for messages
  socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data)
    if (event.data === 'pong') {
      console.log('Received pong from server.'); // Server responded to our 'ping'
    } else {
      // console.log('Received message from server:', event.data);
    } 

    if (data.user_status_update) {
      console.log(`USER STATUS UPDATED`)
      const { userId, status} = data.user_status_update;
      handleUserStatusUpdate(data.user_status_update.userId, data.user_status_update.status);
      console.log(`FETCHING user_status_update`)
      fetchUsers(lobbyId);
    } else if (data.end_game) {
      dispatch({ type: 'SET_GAMEINPROGRESS', payload: false });
      // localStorage.setItem('gameInProgress', 'false');
      navigate(`/stats`)
    } else if (data.genreToSet) {
      console.log(`WORKING HERE`)
      let genre = data.genreToSet.genre
      setSelectedGenre(genre.replaceAll('_', ' '))
      console.log(`SETTING GENRE TO ${data.genreToSet.genre.replaceAll('_', ' ')}`)
      setGenre(data.genreToSet.genre.replaceAll('_', ' '))
      dispatch({ type: 'SET_GENRE', payload: data.genreToSet.genre });
      localStorage.setItem('genre', genre);
      setGenreDB(userId, userId2, data.genreToSet.genre)
      socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
    } else if (data.invite) {
      setInvited(true)
      console.log(`FETCHING data.invite`)

      fetchUsers(uuid);
    } else if (data.logout) {
      // const { sender, recipient } = data.invite;
      console.log(`FETCHING uuid`)

      fetchUsers(params.lobbyId);
    } else if (data.leave) {
      // const { sender, recipient } = data.invite;
      console.log(`FETCHING lobbyid`)

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
            user2: userId2
          }
        }));
        console.log(`FETCHING invitee`)

        fetchUsers(uuid)
      } else {
        // cancel button clicked
        socket.send(JSON.stringify({
          type: 'user_rejected',
          payload: {
            reject: userId,
            request: userId2
          }
        }));
      }
    } else if (data.user_rejected) {
      // const { sender, recipient } = data.invite;
      alert(`USER ${data.user_rejected.reject} rejected the invitation`)
      console.log(`FETCHING user_rejected`)

      fetchUsers(params.lobbyId);
    } else if (data.refresh) {
      // const { sender, recipient } = data.invite;
      // console.log(`REFRESH`)
      console.log(`FETCHING refresh`)

      // fetchUsers(params.lobbyId);
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
    // console.log("EXECUTING_")
    
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
      console.log(response.data.users)
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
      // console.log('genres:')
      // genres.forEach(element => {
      //   console.log(element.genre)
      // })
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch genres based on selectedCategory
    fetchGenres();

    if (player1) {
      getUname(player1)
    }

    fetchGenres();
  }, [selectedCategory, selectedGenre, player1]);

  // useEffect(() => {
  //   console.log(`getting genre for user: ${userId} and user: ${userId2}`)
  //   // getGenre(userId, userId2);
  // }, [selectedGenre])

  const fetchPlayer1 = async (game_id: number) => {
    if (gameId) {
      try {
        const response = await axios.get(`${url}/games/player1`, {
          params: {
            game_id: game_id
          }
        });
        // console.log(`PLAYER1: ${response.data.player1_id}`);
        setPlayer1(response.data.player1_id);
        // console.log(`PLAYER 1 UPDATED`)
      } catch (error) {
        console.error(error);
      }
    }
  };

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
      // console.log(`Player1: ${player1} Player2: ${player2}`);
      // console.log('data: ' + response.data.id);
      
      dispatch({ type: 'SET_GAMEID', payload: gameId });
      localStorage.setItem('gameId', gameId.toString());

      // Get the turn ID for current round
      await getTurn(gameId);
      // console.log(`USERID: ${userId} TURN: ${turn} GENRE: ${genre}`)
      if (allUsersReady && playerTurn !== 2) {
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
            socket.send(JSON.stringify({
            type: 'refresh',
            payload: {
              user1: userId,
              user2: userId2
            }
            }));
            dispatch({ type: 'SET_GAMEINPROGRESS', payload: true });
            localStorage.setItem('gameInProgress', 'true');
            console.log(`GameStatus: ${gameInProgress}`)
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

  useEffect(() => {
    // console.log(`GameStatus: ${gameInProgress}`);
  }, [gameInProgress]);


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
    
        // console.log(`Player1: ${player1} Player2: ${player2}`);
        // console.log('data: ' + response.data.id);
        
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
      // console.log(`CURRENT GAME GENRE: ${response.data}`)
      let genre = response.data;
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
    getPlayerTurn(parseInt(userId), gameId)
    getPlayer2Turn(parseInt(userId2), gameId)
  }, [allUsersReady])

  useEffect(() => {
    fetchGenres();
    fetchPlayer1(gameId);
    getTurn(gameId)
    // console.log(`GETTING TURN WITH GAMEID: ${gameId}`)
    getGameStatus();
    // console.log(`Game Status: ${gameStatus}`)
    fetchUsers(lobbyId)
  }, [status]); 

  useEffect(() => {
    if (users.length > 1) {
      getGameID(userId, userId2);
    }
    getU2(userId2)
    users.forEach(element => {
      if (element.user_id === userId && element.status === "In Progress") {
          // console.log(`TRUE`)
          idle(userId)
        } else {
          // console.log(`false: ${status}`)
        }
    })
  }, [users])

  useEffect(() => {
    getTurn(gameId)
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
  }
  }, [users])

  useEffect(() => {
    getGenre(userId, userId2)
    console.log(`changed`)
    fetchUsers(lobbyId)
    socket.onopen = () => {
      socket.send(JSON.stringify({
      type: 'refresh',
      payload: {
        user1: userId,
        user2: userId2
      }
      }));
    }
    console.log(`fetching users from ${lobbyId}`)
  }, [lobbyId])

  const handleReady = async (id: string) => {
    // console.log(`TOKEN: ${token}`)
    
    // console.log(process.env.JWT_SECRET)
    try {
      const response = await axios.put(
        `${url}/lobby?userId=${id}`, {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      const updatedUser = response.data; // Get updated user object with new status
      if (updatedUser.status === 'Ready' || updatedUser.status === 'In Progress') {
        // User is now ready
        setStatus('Idle');

        // console.log(`user ready or in progress`)
        try {
          // socket.onopen = () => {
              socket.send(JSON.stringify({
                type: 'refresh',
                payload: {
                  user1: userId,
                  user2: userId2,
                },
              }));
          // }
          // socket.onopen = () => {
            socket.send(JSON.stringify({
              type: 'user_status_update',
              payload: {
                userId: userId,
                status: 'Idle',
              },
            }));
          // }
          // const response = await axios.get(`${url}/lobby`);
          // Process the response data as needed
        } catch (error) {
          console.error(error);
        }
      } else {
        setStatus('Ready'); 
        
        // console.log(`user`)
        // User is now idle
        // socket.onopen = () => {
          socket.send(JSON.stringify({
            type: 'user_status_update',
            payload: {
              userId: userId,
              status: 'Ready',
            },
          }));
        // }
        // socket.onopen = () => {
          socket.send(JSON.stringify({
            type: 'refresh',
            payload: {
              user1: userId,
              user2: userId2,
            },
          }));
          fetchUsers(uuid);
        // }

        // const allReady = users.every(user => user.status === 'Ready' || user.status === 'In Progress');
        // setAllUsersReady(allReady); // Update flag based on current state of users
      }
    } catch (error) {
      console.error(error);
    }
  };

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
        // socket.onopen = () => {
          socket.send(JSON.stringify({
            type: 'invitee',
            payload: {
              userId: response.data,
              lobbyId: lobbyId,
              sender: userId
            }
          }));
        // }
        // navigate('/')
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEnd = async () => {
    try {
      const message = { payload: 'end' };
      // socket.onopen = () => {
        socket.send(JSON.stringify(message));
      // }
      await axios.put(`${url}/games/status/reset`, {
        player1: userId,
        player2: userId2
      }
    )
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserStatusUpdate = (user_id: string, status: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.user_id === user_id ? { ...user, status: status } : user
      )
    );
  };

  useEffect(() => {
    console.log(`REFRESHED CATEGORY`)
    socket.onopen = () => { 
      socket.send(JSON.stringify({
        type: 'refresh',
        payload: {
          user1: userId,
          user2: userId2
        }
      }));
    }
  }, [selectedCategory])

  function CategoryList() {  
    return (
      <div className="category-list-container">
      {selectedCategory === '' ? (
        <>
            {/* <h2 className="lobby-header">Categories:</h2> */}
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
           <div className="selected-category-container">
          {/* <h2 className="lobby-header">{selectedCategory}:</h2> */}
          <button className="back-button" onClick={() => {setSelectedCategory('')}}>⬅ BACK</button>
        </div>
        )}
      </div>
    );
  }

  function GenreList() {
    const [selectedGenres, setSelectedGenres] = useState<{ [key: string]: boolean }>({});
  
    const handleGenreClick = async (genreId: string, genre: string) => {
      setSelectedGenres((prevState) => ({
        ...prevState,
        [genreId]: !prevState[genreId],
      }));
  
      try {
        const response = await axios.put(`${url}/games/genre`, {
          player1: userId,
          player2: userId2,
          genre: genre,
        });
      } catch (err) {
        console.log(err);
        console.log('Error updating the genre');
      }
  
      // socket.onopen = () => {
        const message = {
          type: 'set_genre',
          payload: {
            type: 'set_genre',
            uuid: uuid,
            genre: genre,
          },
        };
        socket.send(JSON.stringify(message));
      // };
    };
  
    return (
      <div>
        {Array.isArray(genres) &&
          genres.map((genre) =>
            genre.category.replaceAll('_', ' ') === selectedCategory.replaceAll('_', ' ') ? (
              <div className="category-list-container" key={genre.id}>
                <div
                  className={`selected-category-container ${
                    selectedGenre.replaceAll('_', ' ') === genre.genre.replaceAll('_', ' ') ? 'selected' : 'unselected'
                  }`}
                  onClick={() => {
                    // console.log(`SELECTED ${genre.genre}`);
                    // console.log(`SELECTEDGENRE ${selectedGenre}`);
                    handleGenreClick(genre.id.toString(), genre.genre);
                    setSelectedGenre(genre.genre.replaceAll('_', ' '));
                    // socket.onopen = () => {
                      // console.log('SETTING GENRE IN WS');
                      const message = {
                        payload: {
                          type: 'set_genre',
                          genre: genre,
                        },
                      };
                      socket.send(JSON.stringify(message));
                    // };
                  }}
                >
                  {genre.genre.replaceAll('_', ' ')}
                </div>
              </div>
            ) : null
          )}
      </div>
    );
  }

  function UserList(props: UserListProps) {
    const { users } = props;
  
    // Sort the users by username
    const sortedUsers = users.sort((a, b) => a.username.localeCompare(b.username));
  
    return (
      <ul className="lobby-userlist">
        {Array.isArray(sortedUsers) &&
          sortedUsers.map((user) => (
            <li key={user.user_id} className="lobby-row" style={{ listStyle: 'none' }}>
              <span className="username">{toPascalCase(user.username)}</span>
              <div className={`status ${user.status.toLowerCase()}`}>
                {user.status}
              </div>
            </li>
          ))}
      </ul>
    );
  }
  
  //TODO add dynamic background tailored to selected category

  return (
    <div className="lobby-container">
      <MenuButton lobbyId={lobbyId} userId={userId} socket={socket} />
      {users.length < 2 ? (
      <div className="search-container">
        <input className="search-form" type="text" value={inviteeUsername} onClick={() => setInviteeUsername('')} onChange={(e) => setInviteeUsername(e.target.value)} />
        <button disabled={users.length >=2} id="leave" className="invite-button" onClick={() => handleInviteUser(inviteeUsername)}>Invite User</button>
      </div>
      ) : null}
      {/* <h3 className="lobby-header">Users In Lobby:</h3> */}
      <UserList users={users} handleReady={handleReady} handleStatusUpdate={handleUserStatusUpdate}/>
      <button className="ready-button" onClick={() => handleReady(userId)}>Ready?</button>
      {genre !== '' ? (      
      <div><h1 className="genre-header">Genre is set to <span className="lobby-genre">{selectedGenre}</span></h1></div>
      ) : <></>}
      {playerTurn === 2 && player2Turn !== 2 ? <div><h1 className="lobby-waiting">Waiting on {username} to finish</h1></div> : <></>}
      {userId.toString() === player1.toString() || users.length === 1 ? (
      <><CategoryList /><GenreList /></>
      ) : (
        <></>
      )}
      <button disabled={!allUsersReady || users.length < 2}
 className="start-button" onClick={() => handleStartGame(allUsersReady, userId, users[0].user_id, users[1].user_id)}>Start Game</button>
    </div>
  );
};

export default Lobby;
