import axios from "axios";
import { url } from "./Config";
import './styles.css'
import { useContext, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import UserContext from "./Components/UserContext";
import { useSelector } from "react-redux";
import { AppState } from './store'

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
  const percentCorrect = props.correctlyAnswered / props.totalQuestions * 100;
  const storeId = useSelector((state: AppState) => state.userId);
  const [username, setUserName] = useState(storeId);
  const { user, setUser } = useContext(UserContext);
  const userId = useSelector((state: AppState) => state.userId);

  async function getUname(id: string) {
    try {
      const response = await axios.get(`${url}/api/username`, {
        params: {
          userId: id
        },
      });
      
      setUserName(response.data.rows[0].username)
      console.log(`User Data: ${response.data.userId}`); // handle the response from the backend
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getUname(props.user)
  }, [props.user])

  return (
    <div className="stats-page">
      <p className="stats-header">User: {username}</p>
      <button>{userId}</button>
      <p className="stats-row">Points: {props.points}</p>
      <p className="stats-row"># Correct This Round: {props.correctlyAnswered} of {props.totalQuestions}</p>
      <p className="stats-row">{percentCorrect}%</p>

      <p className="stats-header">========== Historical Stats ==========</p>
      <p className="stats-row">Total Correct: {props.totalCorrect}</p>
      <p className="stats-row">Total Wrong: {props.totalIncorrect}</p>
      <p className="stats-row">Total Historical: {props.totalHistorical}</p>
      <p className="stats-row">{props.totalCorrect / props.totalHistorical * 100}%</p>
    </div>
  )
}

const Statistics = (props: StatisticsProps) => {
  const userId = useSelector((state: AppState) => state.userId);

  return (
    // <UserContext.Provider value={{ user: "7", setUser: () => {} }}>
      <MyComponent
        user={userId}
        points={props.points}
        correctlyAnswered={props.correctlyAnswered}
        totalQuestions={props.totalQuestions}
        totalCorrect={props.totalCorrect}
        totalIncorrect={props.totalIncorrect}
        totalHistorical={props.totalHistorical}
      />
    // </UserContext.Provider>
  );
}

export default Statistics;
