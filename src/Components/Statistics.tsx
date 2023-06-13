import axios from "axios";
import { url } from "../Config";
import "../styles.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store";
import { useNavigate } from "react-router-dom";

interface StatisticsProps {
  uuid: string
  user: string;
  points: number;
  correctlyAnswered: number;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalHistorical: number;
}

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

interface GuessProps {
  user_id: number,
  question_id: number,
  guess: number
}

const MyComponent = (props: StatisticsProps) => {
  const percentCorrect = (props.correctlyAnswered / props.totalQuestions) * 100;
  const [username, setUserName] = useState(props.user);
  const navigate = useNavigate();
  const userId = useSelector((state: AppState) => state.userId);
  const userId2 = useSelector((state: AppState) => state.userId2);
  const [data, setData] = useState<CardProps[]>([]);
  const genre = useSelector((state: AppState) => state.genre);
  const [answers, setAnswers] = useState<AnswerProps[]>([]);
  const [guesses, setGuesses] = useState<GuessProps[]>([]);
  const gameId = useSelector((state: AppState) => state.gameId);

  useEffect(() => {
    fetchData(genre);
  }, [0])

  useEffect(() => {
    console.log(answers)
  }, [answers])

  async function getUname(id: string) {
    try {
      const response = await axios.get(`${url}/username`, {
        params: {
          userId: id
        }
      });

      setUserName(response.data.rows[0].username);
      console.log(`User Data: ${response.data.rows[0].userId}`); // handle the response from the backend
    } catch (error) {
      console.error(error);
    }
  }

  function QuestionData() {
    if (!Array.isArray(data) || guesses.length === 0) {
      return <p>Loading...</p>; // or any other loading indicator
    }
  
    return (
      <ul>
        {data.map((entry) => (
          <li key={entry.id} className="stats-text" style={{ listStyle: "none" }}>
            <div className="stats-question">{entry.id} {entry.question}</div>
            {guesses[entry.id] && (
              <>
                <div className="stats-guess">
                  {entry.id} You Guessed: {entry.options[guesses[entry.id].guess]}
                </div>
                <div className="stats-answer">
                  {entry.id} They Answered: {entry.options[answers[entry.id].answer]}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    );
  }
  
  async function fetchData(genre: string) {
    const response = await axios.get(`${url}/questions`, {
      params: {
        genre: genre
      }
    });
    const jsonData = response.data;
    console.log(jsonData)
    setData(jsonData);
  }

  async function fetchAnswers(game_id: number, user_id: string) {
    try { 
      const response = await axios.get(`${url}/answers`, {
        params: {
          game_id: game_id,
          user_id: user_id
        },
      });
      console.log(`ANSWERS for gameId: ${gameId} USERID: ${user_id}`, response.data); // Log all rows to the console
      setAnswers(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      // Handle error
      return null;
    }
  }

  async function fetchGuesses(gameId: number, userId: string) {
    const response = await axios.get(`${url}/guesses`, {
      params: {
        gameId: gameId,
        userId: userId
      }      
    });
    const jsonData = response.data;
    setGuesses(jsonData);
    console.log(`GUESSES: ${jsonData.rows}`)
  }

  useEffect(() => {
    getUname(props.user);
    fetchAnswers(gameId, userId2)
    fetchGuesses(gameId, userId)
  }, [data]);

  return (
    <div className="stats-page">
      <button className="return-button" style={{marginTop: 15}} onClick={() => navigate(`/lobby/${props.uuid}`)}>Return To Lobby</button>
      <QuestionData />
      {username[-1] === 's' ? <p className="stats-header">{userId2}' Stats</p>
      : <p className="stats-header">{username}'s Stats</p>
      }
      <p className="stats-row">Points: {props.points}</p>
      <p className="stats-row">
        # Correct This Round: {props.correctlyAnswered} of {props.totalQuestions}
      </p>
      {props.totalQuestions !== 0 ? (
        <p className="stats-row">{`${percentCorrect.toFixed(2)}%`}</p>
      ) : (
        <p className="stats-row">No Guesses this round</p>
      )}
      <p className="stats-header">========== Historical Stats ==========</p>
      <p className="stats-row">Total Correct: {props.totalCorrect}</p>
      <p className="stats-row">Total Wrong: {props.totalIncorrect}</p>
      <p className="stats-row">Total Historical: {props.totalHistorical}</p>
      <p className="stats-row">
        {`${(props.totalCorrect / props.totalHistorical * 100).toFixed(2)}%`}
      </p>
    </div>
  );
};

const Statistics = () => {
  const userId = useSelector((state: AppState) => state.userId);
  const [userPoints, setUserPoints] = useState(Object);
  const uuid = useSelector((state: AppState) => state.uuid);

  useEffect(() => {
    getUserPoints(parseInt(userId))
  })

  const getUserPoints = async (uid: number) => {
    try {
        const response = await axios.get(`${url}/points`, {
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

  return (
    <MyComponent
      uuid={uuid}
      user={userId}
      points={userPoints.points}
      correctlyAnswered={userPoints.correct_round}
      totalQuestions={userPoints.total_round}
      totalCorrect={userPoints.total_correct}
      totalIncorrect={userPoints.total_incorrect}
      totalHistorical={userPoints.total_guess}
    />
  );
};

export default Statistics;
