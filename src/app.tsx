import { Col, Row } from "books-ui";

import { dataQuestions } from "./data/game-question-data";
import GameCarQuestion from "./game-car-quiz/GameCarQuiz";


function App() {

  return (
    <Row alignItems="center" justifyContent="center" style={{ height: "100vh" }}>
      <Col xs="7" >
     <GameCarQuestion data={dataQuestions} />
      </Col>
    </Row>
  );
}

export default App;
