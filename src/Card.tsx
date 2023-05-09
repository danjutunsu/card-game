import { useEffect, useState } from "react";
import { url } from "./Config";
import Statistics from "./Statistics";
import axios from "axios";
import { Hash } from "crypto";
import LoginForm from "./Components/LoginForm";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "./store";
import { json } from "stream/consumers";

// const navigate = useNavigate();

interface CardProps {
    id: number,
    question: string,
    options: string[],
    answer: number
}

const Card: React.FC = () => {
    const [data, setData] = useState<CardProps[]>([]);
    const [randomQuestion, setRandomQuestion] = useState<number>(0);
    const [visited, setVisited] = useState<number[]>([]);
    const [answered, setAnswered] = useState<number>(0);
    const [correctlyAnswered, setCorrectlyAnswered] = useState<number>(0);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [user, setUser] = useState<string>('');
    const [userPoints, setUserPoints] = useState(Object);
    const location = useLocation();
    const userId = useSelector((state: AppState) => state.userId);
    const userId2 = useSelector((state: AppState) => state.userId2);
    const [gameStatus, setGameStatus] = useState()

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const response = await axios.get(`${url}/api/questions`);
            const jsonData = response.data;
            setData(jsonData);
        }
        fetchData();
        getGameStatus(userId, userId2)
    }, []);

    const getGameStatus = async (player1: string, player2: string) => 
    {
      console.log("EXECUTING-_______________")
      console.log(`Player1: ${userId}`)
      console.log(`Player2: ${userId2}`)
      const response = await axios.get(`${url}/api/games/status`, {
        params: {
          player1: player1,
          player2: player2
        }
      })
      const jsonData = response.data.game_status;

      setGameStatus(jsonData)
      if (jsonData === "0") {
        // console.log("ANSWERING")
      }
      return jsonData;
    }

    //initialze with a random question
    //update state upon initialization
    useEffect(() => {
        ResetRound(parseInt(userId))
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

    const ResetRound = async (userId: number) => {
        try {
          const response = await axios.post(`${url}/api/reset`, {
            userId: userId
          });
          console.log(response.data); // handle the response from the backend
        } catch (error) {
          console.error(error);
        }
    } 
      
    async function getRandomQuestion() {
      if (visited.length === data.length) {
        // all questions have been visited
        console.log("Finished Guessing")
        getUserPoints(parseInt(userId))
        await axios.put(`${url}/api/games/turn`,)
        navigate('/lobby');
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

    const addGuess = async (userId: number, questionId: number, userGuess: number) => {
        try {
          const response = await axios.post(`${url}/api/guesses`, {
            userId: userId,
            questionId: questionId,
            userGuess: userGuess
          });
          console.log(response.data); // handle the response from the backend
        } catch (error) {
          console.error(error);
        }
    } 

    const addAnswer = async (userId: number, questionId: number, answer: number, answered: number, count: number) => {
        try {
          const response = await axios.post(`${url}/api/answers`, {
            userId: userId,
            questionId: questionId,
            answer: answer,
            answered: answered,
            count: count
          });
          if (answered === data.length) {
            await axios.put(`${url}/api/games`, {
                userId: userId,
                questionId: questionId,
                answer: answer,
                answered: answered,
                count: count
              });
          }
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
      
    function handleAnswerNextQuestion(index: number) {
      console.log("ANSWERING")
      const questionId = data[randomQuestion].id;
      const userAnswer = index;
      addAnswer(parseInt(userId), questionId, userAnswer, answered, data.length);
      setAnswered(answered+1)
      getRandomQuestion();
    }

    function handleNextQuestion(index: number) {
      console.log("GUESSING")
      const questionId = data[randomQuestion].id;
      const userGuess = index;
      addGuess(parseInt(userId), questionId, userGuess);
      if (index === data[randomQuestion].answer)
      {
          console.log("CORRECT")
          setCorrectlyAnswered(correctlyAnswered+1)
          getRandomQuestion();
      }
      else
      {
          console.log("INCORRECT")
          getRandomQuestion();
      }
      setAnswered(answered+1)
    }
    
    return (
      <div className="card-page">
        {gameStatus === '0' ? (
        <div>
        {data[randomQuestion] && (
          <p className="card-header">{data[randomQuestion].question}</p>)}
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
        <div>
        {data[randomQuestion] && (
          <p className="card-header">{data[randomQuestion].question}</p>)}
          {data[randomQuestion]?.options?.map((option, index) => (
            <div key={index}>
              <div className="button-container">
                <button className="button" onClick={() => handleNextQuestion(index)}>
                  {option}
                </button>
              </div>
            </div>
          ))}
        </div>
        }
      </div>
    );    
}

export default Card;
