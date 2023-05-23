import { useEffect, useState } from "react";
import { url } from "./Config";
import axios from "axios";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "./store";

// const navigate = useNavigate();
//TODO -- add feature at game end -- compare answers to guesses and show both which players picked

interface CardProps {
  id: number,
  question: string,
  options: string[],
  answer: number
}

interface AnswerProps {
  user_id: number,
  question_id: number,
  answer: number
}

interface QuestionProps {
  id: number,
  question: number,
  answer: number
}

const Card = () => {
  const userId = useSelector((state: AppState) => state.userId);
  const userId2 = useSelector((state: AppState) => state.userId2);
  const uuid = useSelector((state: AppState) => state.uuid);
  const [data, setData] = useState<CardProps[]>([]);
  const [answers, setAnswers] = useState<AnswerProps[]>([]);
  const [guesses, setGuesses] = useState<QuestionProps[]>([]);
  const [randomQuestion, setRandomQuestion] = useState<number>(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [answered, setAnswered] = useState<number>(0);
  const [correctlyAnswered, setCorrectlyAnswered] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [user, setUser] = useState<string>('');
  const [username2, setUsername2] = useState(userId2);
  const [userPoints, setUserPoints] = useState(Object);
  const location = useLocation();
  const [genre, setGenre] = useState('')
  const [gameStatus, setGameStatus] = useState()
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gameId = useSelector((state: AppState) => state.gameId);

  //create new socket
  const socket = new WebSocket(`ws://10.0.0.197:3002?userId=${userId}`)

  const handleEnd = async () => {
    try {
      const message = { payload: 'end' };
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(error);
    }
  };

  async function idle(userId: string) {
    try {
      socket.send(JSON.stringify({
        type: 'user_status_update',
        payload: {
          userId: userId,
          status: "Idle"
        }
      }));
      const response = await axios.put(`${url}/api/lobby/idle`, null, {
        params: {
          userId: userId
        }
      });
    } catch (error) {
      console.error(error);
    }
  }  

  window.addEventListener('popstate', (event) => {
    idle(userId)
  })

  // // Listen for messages
  socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data)
    if (data.end_game) {
      console.log("NAVIGATING TO STATS")
      navigate(`/stats`)
    }
    if (data.reset) {
      console.log(`RESET`)
    }
  });

  useEffect(() => {
    getGenre(userId, userId2);
  }, [userPoints]);

  async function getGenre(player1:string, player2:string) {
    try {
      const response = await axios.get(`${url}/api/games/genre`, {
        params: { player1: player1, player2: player2 }
      });
      const data = response.data;
      setGenre(data);
      fetchData(data)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    dispatch({ type: 'SET_GENRE', payload: genre });
    localStorage.setItem('genre', genre);
  }, [genre])

  async function fetchData(genre: string) {
    const response = await axios.get(`${url}/api/questions/`, {
      params: {
        genre: genre
      }
    });
    const jsonData = response.data;
    setData(jsonData);
  }

  useEffect(() => {
    getGenre(userId, userId2)

    if (userId && userId2) {
      getGameStatus(userId, userId2);
    }
      async function fetchUsername() {
        const u2 = await getUname(userId2);
        console.log(userId2)
        setUsername2(u2);
      }
    fetchUsername();
  }, []);
    
  async function fetchAnswers() {
    const response = await axios.get(`${url}/api/answers`);
    const jsonData = response.data;
    setAnswers(jsonData);
  }

  useEffect(() => {
    if (answers.length > 0 && (gameStatus === 1 || gameStatus === 3)) {
      let correct = 0;
      let total = 0;

      guesses.forEach(element => {
        total++;
        const guess = element.answer
        const guessQuestion = element.question
        const answer = answers.find((a) => a.user_id === element.id && a.question_id === element.question)
        console.log(`${data[guessQuestion]?.question}`)
        console.log(`You guessed ${element?.answer}`)
        console.log(`They answered ${answer?.answer}`)
        if (guess === answer?.answer) {
          correct++
        }
        console.log(`user ${element.id} guess for question ${element.question}: ${element.answer}`)
        console.log(`User ${answer?.user_id} answer for question ${answer?.question_id}: ${answer?.answer}`)
        });
      console.log("# CORRECT: " + correct)
      addPoints(userId, correct, total)
    }
  }, [answers])

    const addPoints = async (userId: string, points: number, total: number) => {
      console.log("UPDATING POINTS")
      await axios.put(`${url}/api/points`, {
        userId,
        points,
        total
      })
      console.log("POINTS SHOULD BE INSERTED")
    }

    const getGameStatus = async (player1: string, player2: string) => 
    {
      console.log("EXECUTING-_______________")
      console.log(player1, player2)
      const response = await axios.get(`${url}/api/games/status`, {
        params: {
          player1: player1,
          player2: player2
        }
      })
      const jsonData = response.data.game_status;

      setGameStatus(jsonData)
      if (jsonData === 0) {
        console.log('resetting')
        try {
          const message = { payload: 'reset' };
          socket.send(JSON.stringify(message));

        } catch (error) {
          console.error(error);
        }
        // console.log("ANSWERING")
      }
      return jsonData;
    }

    //initialze with a random question
    //update state upon initialization
    useEffect(() => {
        if (data.length > 0) {
          const initialIndex = Math.floor(Math.random() * data.length);
          setTotalQuestions(data.length)
          setRandomQuestion(initialIndex);
          setVisited([initialIndex]);
        }
      }, [data]);

    const GetStats = async () => 
    {
        let total = 0;
        const response = await fetch(`${url}/api/stats`);
        const jsonData = await response.json();
        jsonData.forEach((obj: { userGuess: string }) => 
        {
            // console.log(obj.userGuess)
            // total += Number(obj.userGuess)
            total ++;
        });
        console.log(`Total: ${total}`)
    }

    const ResetRound = async (userId: number, userId2: number) => {
      console.log(`Altering `)
        try {
          const response = await axios.put(`${url}/api/reset`, {
            userId: userId,
            userId2: userId2
          });
          setAnswers([])
          console.log(response.data); // handle the response from the backend
        } catch (error) {
          console.error(error);
        }
    } 
      
    async function getRandomQuestion() {
      if (visited.length === data.length) {
        // all questions have been visited
        console.log("Finished Guessing")
        await fetchAnswers()
        if (guesses.length > 0) {
          console.log("USER GUESSES:")
        }
        getUserPoints(parseInt(userId))
        if (gameStatus === 0 || gameStatus === 2) {
        await axios.put(`${url}/api/games/turn`, {
          player1: userId,
          player2: userId2
        })
        }
        await axios.put(`${url}/api/games/status`, {
            player1: userId,
            player2: userId2
          }
        )
        console.log(`game status before navigating: ${gameStatus}`)
        if (gameStatus === 3) {
          handleEnd()
        } else {
          navigate(`/lobby/${uuid}`)
        }
        return null; // return the current question
      }
    
      let index = Math.floor(Math.random() * data.length);
    
      while (visited.includes(index)) {
        index = Math.floor(Math.random() * data.length);
        console.log('while')
        if (visited.length === data.length) {
          // all questions have been visited
          getUserPoints(parseInt(userId))
          return index; // return the last index
        }
      }
    
      setRandomQuestion(index);
      setVisited([...visited, index]);
      console.log(`Visited: ${visited.length}`)
      console.log(`Data: ${data.length}`)
    
      return index;
    }

    const nextRound = async (currentUser: number) => {
        try {
            const response = await axios.post(`${url}/api/round`, {
                currentUser: currentUser
            })
        } catch (err) {

        }
    }      

    const addGuess = async (userId: number, questionId: number, userGuess: number, gameId: number) => {
        try {
          const response = await axios.post(`${url}/api/guesses`, {
            userId: userId,
            questionId: questionId,
            userGuess: userGuess,
            gameId: gameId
          });
          console.log(response.data); // handle the response from the backend
        } catch (error) {
          console.error(error);
        }
    } 

    const addAnswer = async (userId: number, questionId: number, answer: number, answered: number, count: number, gameId: number) => {
        try {
          const response = await axios.post(`${url}/api/answers`, {
            userId: userId,
            questionId: questionId,
            answer: answer,
            answered: answered,
            count: count,
            gameId: gameId
          });
          console.log(response.data); // handle the response from the backend
        } catch (error) {
          console.error(error);
        }
    } 

    const getUserPoints = async (uid: number) => {
        try {
            const response = await axios.get(`${url}/api/points`, {
                params: 
                {
                    userId: uid,
                },
            });
    
            setUserPoints(response.data[0]);             
        } catch (error) {
            console.error(error);
        }
    }    

    const getUser = async (uid: number) => {
        try {
            const response = await axios.get(`${url}/api/user`, {
                params: 
                {
                    userId: uid,
                },
            });
            console.log(`User Data: ${response.data.userId}`); // handle the response from the backend
        } catch (error) {
            console.error(error);
        }
    } 

    async function getUname(id: string) {
      try {
        const response = await axios.get(`${url}/api/username`, {
          params: {
            userId: id
          },
        });
        
        return response.data.rows[0].username
      //   console.log(`User Data: ${response.data.userId}`); // handle the response from the backend
      } catch (error) {
        console.error(error);
      }
    }

    const addNewGuess = (id: number, question: number, answer: number) => {
      const newGuess = { id, question, answer };
      setGuesses(prevGuesses => [...prevGuesses, newGuess]);
    }

    function handleAnswerNextQuestion(index: number) {
      console.log("ANSWERING")
      const questionId = data[randomQuestion].id;
      const userAnswer = index;
      addAnswer(parseInt(userId), questionId, userAnswer, answered, data.length, gameId);
      setAnswered(answered+1)
      getRandomQuestion();
    }

    const changePronouns = (question: string): string => {
      const pronouns: { [key: string]: string } = {
        I: "he",
        me: "him",
        my: "his",
        mine: "his",
        we: "they",
        us: "them",
        our: "their",
        ours: "theirs",
        you: "they",
        your: "their",
        yours: "theirs"
        // Add more pronouns as needed
      };
    
      const words = question.split(" ");
      const transformedWords = words.map((word) => {
        const lowerCasedWord = word.toLowerCase();
        if (pronouns.hasOwnProperty(lowerCasedWord)) {
          const pronoun = pronouns[lowerCasedWord];
          return word.charAt(0) === word.charAt(0).toUpperCase()
            ? pronoun.charAt(0).toUpperCase() + pronoun.slice(1)
            : pronoun;
        }
        return word;
      });
    
      return transformedWords.join(" ");
    };

    function handleNextQuestion(index: number) {
      console.log("GUESSING")
      console.log(userId, userId2)
      const questionId = data[randomQuestion].id;
      const userGuess = index;
      addGuess(parseInt(userId), questionId, userGuess, gameId);
      addNewGuess(parseInt(userId), questionId, index)
      console.log('Question ' + questionId)
      // addGuess(parseInt(userId2), questionId, userGuess);

      if (index === 0)
      {
        console.log("CORRECT")
        setCorrectlyAnswered(correctlyAnswered+1)
        getRandomQuestion();
      }
      else
      {
        // console.log(`index: ${index}`)
        // console.log(`answer: ${answers[randomQuestion].answer}`)
        console.log("INCORRECT")
        getRandomQuestion();
      }
      setAnswered(answered+1)
    }
    
    return (
      <div className="card-page">
        {gameStatus === 0 || gameStatus === 2 ? (
        <div>
          <div className="button-container">
            <button className="return-button" onClick={() => navigate(`/lobby/${uuid}`)}>Return To Lobby</button>
          </div>
        {data[randomQuestion] && (
          <p className="card-question">{data[randomQuestion].question}</p>)}
          {/* <h1 className="card-header">You are answering</h1> */}
          {data[randomQuestion]?.options?.map((option, index) => (
            <div key={index}>
              <div className="button-container">
                <button className="button" onClick={() => handleAnswerNextQuestion(index)}>
                  {option}
                </button>
              </div>
            </div>
          ))}
        </div>
        ) :
        <>        
        <div className="button-container">
            <button className="return-button" onClick={() => navigate(`/lobby/${uuid}`)}>Return To Lobby</button>
          </div>
        {/* <h1 className="card-header">How did<span className="lobby-username">{username2}</span> answer this question?</h1> */}
          <div className="card">
            {data[randomQuestion] && (
              <><p className="card-question">{changePronouns(data[randomQuestion].question)}</p></>)}
            {data[randomQuestion]?.options?.map((option, index) => (
              <div key={index}>
                <div className="button-container">
                  <button className="button" onClick={() => handleNextQuestion(index)}>
                    {option}
                  </button>
                </div>
              </div>
            ))}
          </div></>
        }
      </div>
    );    
}

export default Card;
