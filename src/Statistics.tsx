import axios from "axios";
import { url } from "./Config";

interface StatisticsProps {
    user: string,
    points: number,
    correctlyAnswered: number,
    totalQuestions: number,
    totalCorrect: number,
    totalIncorrect: number,
    totalHistorical: number
}

const Statistics = (props: StatisticsProps) => {
    const percentCorrect = props.correctlyAnswered / props.totalQuestions * 100;
    
    return (
        <div>
            <p>User: {props.user}</p>
            <p>Points: {props.points}</p>
            <p>Number of Correct this round: {props.correctlyAnswered} out of {props.totalQuestions}</p>
            <p>{percentCorrect}%</p>

            <p>========== Historical Stats ==========</p>
            <p>Total Correct: {props.totalCorrect}</p>
            <p>Total Wrong: {props.totalIncorrect}</p>
            <p>Total Historical: {props.totalHistorical}</p>
            <p>{props.totalCorrect / props.totalHistorical * 100}%</p>
        </div>
    )
}

export default Statistics;