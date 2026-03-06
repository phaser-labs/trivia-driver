//import { useCallback, useState } from 'react';
import { Col, Row } from 'books-ui';

import { dataQuestions } from './data/data-game-car-question';
import GameCarQuestion/* , { GameResult } */ from './game-car-quiz/game-car-quiz';
//import { ModalFeedback } from '@/shared/core/components';

/* type FeedbackContent = {
  title?: string;
  description: string;
  audio: string;
};

const dataFeedbackQuestion1: { [key: string]: FeedbackContent } = {
  a: {
    title: 'Respuesta fallida en A',
    description: 'No lo hiciste bien. ¡Muy mal!',
    audio: 'assets/audios/errorA.mp3'
  },
  b: {
    title: '¡Excelente respuesta!',
    description: 'Has encontrado la respuesta correcta. ¡Sigue así!',
    audio: 'assets/audios/successB.mp3'
  },
  c: {
    title: 'Respuesta incorrecta en C',
    description: 'Has encontrado la respuesta incorrecta. ¡Sigue intentando!',
    audio: 'assets/audios/errorC.mp3'
  }
}; */


function App() {
/*    const [modalOpen, setModalOpen] = useState<'success' | 'wrong' | null>(null);
    const [currentResult, setCurrentResult] = useState<GameResult | null>(null);
    const closeModal = () => {
      setModalOpen(null);
    };
  
    const handleResult = useCallback((result: GameResult) => {
      console.log(result);
      setCurrentResult(result);
      setModalOpen(result.isCorrect ? 'success' : 'wrong');
    }, []);
  
    const getModalFeedbackContent = () => {
      if (!currentResult) return { title: '', description: '', audio: '' };
  
      // Caso especial para la pregunta de indice 1
      if (currentResult.questionIndex === 0) {
        if (currentResult.selectedAnswer === 'b') {
          return dataFeedbackQuestion1.b;
        } else {
          return dataFeedbackQuestion1[currentResult.selectedAnswer as 'a' | 'c' ];
        }
      } else {
        // Resto de preguntas 
        return {
          description: currentResult.isCorrect ? 'Has respondido correctamente' : 'Has respondido incorrectamente',
          audio: currentResult.isCorrect ? 'assets/audios/success.mp3' : 'assets/audios/error.mp3'
        };
      }
    }; */
  return (
    <>
     <Row alignItems="center" justifyContent="center" style={{ height: "100vh" }}>
      <Col xs="7" >
     <GameCarQuestion data={dataQuestions} onResult={(result) => console.log(result)} />
      </Col>
    </Row>
    {/*  <ModalFeedback
              type={currentResult?.isCorrect ? 'success' : 'wrong'}
              onClose={closeModal}
              finalFocusRef="#main"
              audio={getModalFeedbackContent().audio}
              isOpen={modalOpen !== null}>
              <h2>{getModalFeedbackContent().title ?? ''}</h2>
              <p>{getModalFeedbackContent().description}</p>
            </ModalFeedback> */}
    </>
   
  );
}

export default App;
