import { useEffect, useState } from "react";
import { url } from "./Config";
import Statistics from "./Statistics";
import axios from "axios";
import { Hash } from "crypto";
import LoginForm from "./Components/LoginForm";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

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
    const [userId, setUserId] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            // console.log("WORKING")
            const response = await fetch(`${url}/api/questions`);
            const jsonData = await response.json();
            setData(jsonData);
        }
        fetchData();
    }, []);

    useEffect(() => {
        console.log(`User ID: ${userPoints?.user_id}`);
        console.log(`Points: ${userPoints?.points}`);
        console.log(`Total Guess: ${userPoints?.total_guess}`);
        console.log(`Total Correct: ${userPoints?.total_correct}`);
        console.log(`Total Incorrect: ${userPoints?.total_incorrect}`);
      }, [userPoints]); 

    //initialze with a random question
    //update state upon initialization
    useEffect(() => {
        ResetRound(userId)
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
      
    function getRandomQuestion() {
        if (visited.length === data.length) 
        {
            // all questions have been visited
            console.log("Finished Guessing")
            getUserPoints(userId)
            navigate('/stats');
            return null; // return the current question
        }
    
        let index = Math.floor(Math.random() * data.length);
        while (visited.includes(index)) {
            index = Math.floor(Math.random() * data.length);
        }
        setRandomQuestion(index);
        setVisited([...visited, index]);
        return index;
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
      
    function handleNextQuestion(index: number) {
        const questionId = data[randomQuestion].id;
        const userGuess = index;
        addGuess(userId, questionId, userGuess);
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
                {data.length > 0 && answered < data.length ? (
                    <div>
                        <p>{data[randomQuestion].question}</p>
                        {data[randomQuestion].options.map((option, index) => (
                            <div key={index}>
                                <div className="button-container">
                                    <button className="button" onClick={() => handleNextQuestion(index)}>{option}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <Statistics user={""}
                         points={0} 
                         correctlyAnswered={0} 
                         totalQuestions={0} 
                         totalCorrect={0} 
                         totalIncorrect={0}
                         totalHistorical={0} />
                    </div>
                )}
            </div>
    )
}

export default Card;