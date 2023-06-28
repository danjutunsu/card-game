import axios from "axios";
import { url } from "../Config";
import "../styles.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store";
import { useNavigate } from "react-router-dom";

  //TODO add dynamic background tailored to selected category

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
  
  const body = document.querySelector('body');

  useEffect(() => {
    console.log(`# CORRECT PROPS ${props.correctlyAnswered}`)

  }, [props.correctlyAnswered])

  function changeBodyBackgroundImage(imagePath: string) {
    // document.body.style.backgroundImage = `url(${imagePath})`;
    // document.body.style.backgroundSize = `cover`
  }
  
  // Call the function with the desired image path
  // const imagePath = "../winner.jpg";

  useEffect(() => {
    // changeBodyBackgroundImage(imagePath);
  }, [0])

  useEffect(() => {
    fetchData(genre);
    fetchAnswers(gameId, userId2)

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
        {data.map((entry) => {
          const foundAnswer = answers.find((answer) => answer.question_id === entry.id);
          return (
            <li key={entry.id} className="stats-text" style={{ listStyle: "none" }}>
              <div className="stats-question">{entry.id} {entry.question}</div>
              {guesses[entry.id - 1] && foundAnswer && (
                <>
                  <div className={entry.options[foundAnswer.answer] === entry.options[guesses[entry.id - 1].guess] ? "stats-answer-correct" : "stats-answer-incorrect"}>
                    You Guessed: {entry.options[guesses[entry.id - 1].guess]}
                  </div>
                  <div className={entry.options[foundAnswer.answer] === entry.options[guesses[entry.id - 1].guess] ? "stats-answer-correct" : "stats-answer-incorrect"}>
                    They Answered: {entry.options[foundAnswer.answer]}
                  </div>
                </>
              )}
            </li>
          );
        })}
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

  useEffect(() => {
    if (answers.length > 0) {
      let correct = 0;
      let total = 0;

      guesses.forEach(element => {
        total++;
        const guess = element.guess
        const guessQuestion = element.question_id
        const answer = answers.find((a) => a.user_id.toString() === userId2.toString() && a.question_id === element.question_id)
        console.log(`${data[guessQuestion]?.question}`)
        console.log(`You guessed ${element?.guess}`)
        console.log(`They answered ${answer?.answer}`)
        if (guess === answer?.answer) {
          
          correct++
        }
        console.log(`user ${element.user_id} guess for question ${element.question_id}: ${element.guess}`)
        console.log(`User ${answer?.user_id} answer for question ${answer?.question_id}: ${answer?.answer}`)
      });
      console.log("# CORRECT: " + correct)
      console.log(`$gameid: ${gameId}`)
      
      console.log(`ANSWERS:`)
      answers.forEach(element => {
        console.log(element.answer)
      })
      console.log(`# correct points: ${correct}`)
      addPoints(parseInt(userId), correct, total, gameId)
      console.log(`added points to db`)
    }
  }, [answers])

  const addPoints = async (user_id: number, points: number, total: number, game_id: number) => {
    console.log("UPDATING POINTS");
    console.log(`USER: ${user_id}`);
    console.log(`POINTS: ${points}`);
    console.log(`TOTAL: ${total}`);
    console.log(`GAMEID: ${game_id}`)

    try {
      await axios.get(`${url}/points/game`, {
        params: {
          user_id: user_id,
          game_id: game_id
        }
      });
      console.log(`WORKING 1`)

    try {
      await axios.put(`${url}/points/game`, {
        user_id: user_id,
        game_id: game_id,
        points: points,
        total: total
      });

      console.log("POINTS SHOULD BE INSERTED");

      // Set the flag indicating the request is executed
      localStorage.setItem("isRequestExecuted", "true");
      console.log(`WORKING 2 ${points}`)

    } catch (error) {
      console.error(error);
      // Handle error
    }
    } catch {
      console.log("Game ID and userId don't exist. Inserting new points row");
      try {
        const res = await axios.post(`${url}/points/game`, {
          user_id: user_id,
          game_id: game_id
        });
        console.log("User Created IN POINTS");
      } catch (err) {
        console.log("Couldn't create a new row in points");
      }
    }
  };  

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
    console.log(`GUESSES:`)

    console.log(jsonData)
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
      <p className="stats-header">Historical Stats</p>
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
  const gameId = useSelector((state: AppState) => state.gameId);

  useEffect(() => {
    getUserPoints(parseInt(userId), gameId)
  })

  const getUserPoints = async (uid: number, gameId: number) => {
    try {
        const response = await axios.get(`${url}/points`, {
            params: 
            {
                userId: uid,
                gameId: gameId
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
