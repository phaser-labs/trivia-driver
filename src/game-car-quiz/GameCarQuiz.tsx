import { ControlsGame } from './components/ControlsGame/ControlsGame';
import { GameCanvas } from './components/GameCanvas';
import { ModalQuestion } from './components/ModalQuestion/ModalQuestion';
import { Question } from './game/utils/types/type';

interface GameCarQuestionProps {
    data: Question[];
  }
  
  function GameCarQuestion({ data }: GameCarQuestionProps) {

  return (
    
    <div>
    <div className='container'>
      <GameCanvas />
      <ControlsGame />
    </div>
    <div>
      <ModalQuestion questions={data}  />
    </div>
    </div>
  )
}

export default GameCarQuestion;
