import axios from "axios";
import { url } from "./Config";
import "./styles.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "./store";
import { useNavigate } from "react-router-dom";

interface StatisticsProps {
  user: string;
  points: number;
  correctlyAnswered: number;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalHistorical: number;
}

const MyComponent = (props: StatisticsProps) => {
  const percentCorrect = (props.correctlyAnswered / props.totalQuestions) * 100;
  const [username, setUserName] = useState(props.user);
  const navigate = useNavigate();
  const userId = useSelector((state: AppState) => state.userId);
  const userId2 = useSelector((state: AppState) => state.userId2);

  async function getUname(id: string) {
    try {
      const response = await axios.get(`${url}/api/username`, {
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

  useEffect(() => {
    getUname(props.user);
  }, []);

  return (
    <div className="stats-page">
      {username[-1] === 's' ? <p className="stats-header">{userId2}' Stats</p>
      : <p className="stats-header">{userId2}'s Stats</p>
      }
      <button className="button" onClick={() => navigate(`/lobby`)}>Return To Lobby</button>
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


  useEffect(() => {
    getUserPoints(parseInt(userId))
  })

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

  return (
    <MyComponent
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
