import { ControlsGame } from './components/ControlsGame/ControlsGame';
import { GameCanvas } from './components/GameCanvas';
import { Question } from './game/utils/types/type';

// Tipo para el resultado que se envía al padre
export interface GameResult {
  isCorrect: boolean;
  questionIndex: number;
  selectedAnswer: string;
  correctAnswer: string;
  question: Question;
}

interface GameCarQuestionProps {
  data: Question[];
  onResult?: (result: GameResult) => void;
}
  
function GameCarQuestion({ data, onResult }: GameCarQuestionProps) {

  return (
    <div className='game-car-container'>
      <GameCanvas questions={data} onResult={onResult} />
      <ControlsGame />
    </div>
  )
}

export default GameCarQuestion;
