import { useEffect, useState } from "react";
import { eventBus } from "../../game/eventBus";
import css from './ModalQuestion.module.css';
import { Question } from "../../game/utils/types/type";


interface ModalQuestionProps {
  questions: Question[];
}

export const ModalQuestion = ({ questions }: ModalQuestionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<typeof questions[0] | null>(null);

  useEffect(() => {
    const handleNpcInteraction = (npcId: string) => {
      const question = questions.find(q => q.id === npcId);
      if (question) {
        setCurrentQuestion(question);
        setIsOpen(true);
      }
    };

    const handleCloseModal = () => {
      setIsOpen(false);
    };

    eventBus.on('npcInteracted', handleNpcInteraction);
    eventBus.on('closeModal', handleCloseModal);
    return () => {
      eventBus.off('npcInteracted', handleNpcInteraction);
      eventBus.off('closeModal', handleCloseModal);
    };
  }, [questions]);

  // manejador de respuesta
  // Se llama cuando el jugador selecciona una respuesta  
  const handleAnswer = (selectedIndex: number) => {
    if (!currentQuestion) return;

    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    eventBus.emit('answerSubmitted', isCorrect);
    setIsOpen(false);
  };

  if (!isOpen || !currentQuestion) return null;

  return (
    <div className={css.game_carquiz_modal_overlay}>
      <div className={css.game_carquiz_modal_content} style={{ backgroundImage: `url(${currentQuestion.backgroundImage})` }}>

        <p>{currentQuestion.question}</p>

        <div className={css.game_carquiz_options_container}>
          {currentQuestion.options.map((option, index) => (

            <div key={index}>
              <button
                aria-label={option}
                type="button"
                onClick={() => handleAnswer(index)}
                className={css.game_carquiz_option_button} />
              <p>
                {option}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
