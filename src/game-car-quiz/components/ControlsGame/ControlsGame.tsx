/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { eventBus } from "../../game/eventBus";
import css from './ControlsGame.module.css';

interface Controls {
  key: string;
  src: string;
  alt: string;
  class?: string;
  ariaLabel?: string;
}

const dataControls: Controls[] = [
  { key: 'arrow_up', src: '/assets/game-car-question/img/Controls/arrow_up.png', alt: 'control hacia arriba', class: css.game_carquiz_arrow_up, ariaLabel: 'Click para conducir hacia arriba.' },
  { key: 'arrow_left', src: '/assets/game-car-question/img/Controls/arrow_left.png', alt: 'control hacia la izquierda', class: css.game_carquiz_arrows, ariaLabel: 'Click para conducir hacia la izquierda.' },
  { key: 'arrow_down', src: '/assets/game-car-question/img/Controls/arrow_down.png', alt: 'control hacia abajo', ariaLabel: 'Click para conducir hacia abajo.' },
  { key: 'arrow_right', src: '/assets/game-car-question/img/Controls/arrow_right.png', alt: 'control hacia la derecha', ariaLabel: 'Click para conducir hacia la derecha.' }
];

export const ControlsGame = () => {
  const [openControls, setOpenControls] = useState(false);

  useEffect(() => {
    const toggleListener = () => {
      setOpenControls((prevState) => !prevState);
    };

    const closeListener = () => {
      setOpenControls(false); // 🔴 Cierra los controles al cambiar de escena
    };

    eventBus.on('toggleControls', toggleListener);
    eventBus.on('closeControls', closeListener); // 🔥 Escucha el evento de cierre

    // Limpieza del listener al desmontar el componente
    return () => {
      eventBus.off('toggleControls', toggleListener);
      eventBus.off('closeControls', closeListener);
    };
  }, []);

  if (!openControls) return null;

  // Manejador de los controles del juego.
  const handlePress = (key: string) => (
    _e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLButtonElement>
  ): void => {
    eventBus.emit('key-pressed', { key, pressed: true });
  };

  const handleRelease = (key: string) => (
    _e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLButtonElement>
  ): void => {
    eventBus.emit('key-pressed', { key, pressed: false });
  };

  // Manejador para teclado enter o espacio
  const onKeyDown = (key: string) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePress(key)(e);
    }
  };

  const onKeyUp = (key: string) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRelease(key)(e);
    }
  };

  return (
    <>
      {openControls && (
        <div className={`${css.game_carquiz_controls_game}`}>
          {dataControls.map((control) => (
            <button
              key={control.key}
              onMouseDown={handlePress(control.key)}
              onMouseUp={handleRelease(control.key)}
              onKeyDown={onKeyDown(control.key)}
              onKeyUp={onKeyUp(control.key)}
              className={`${css.game_carquiz_control} ${control.class ? control.class : ''}`}
              aria-label={control.ariaLabel}
            >
              <img src={control.src} alt={control.alt} />
            </button>
          ))}
        </div>
      )}
    </>
  );
};
