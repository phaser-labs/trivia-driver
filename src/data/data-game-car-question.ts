import { Question } from "@/game-car-quiz/game/utils/types/type";


// Datos de ejemplo para las preguntas
export const dataQuestions: Question[] = [
  {
    question: "¿Cuál es la capital de Colombia?",
    options: {
      a: "Medellín",
      b: "Bogotá",
      c: "Cali"
    },
    correctAnswer: "b",
    backgroundImage: "assets/game-car-question/img/Scenes/calle.png"
  },
  {
    question: "¿Qué océanos bordean a Colombia?",
    options: {
      a: "Pacífico y Atlántico",
      b: "Índico y Pacífico",
    },
    correctAnswer: "a",
    backgroundImage: "assets/game-car-question/img/Scenes/interior-casa.png"
  },
  {
    question: "¿Qué escritor colombiano ganó el Premio Nobel de Literatura?",
    options: {
      a: "Álvaro Mutis",
      b: "Rafael Pombo",
      c: "Gabriel García Márquez",
      d: "José Eustasio Rivera"
    },
    correctAnswer: "c",
    backgroundImage: "assets/game-car-question/img/Scenes/local.png"
  },
  {
    question: "¿Cuál es el ritmo musical típico de la costa Caribe colombiana?",
    options: {
      a: "Cumbia",
      b: "Tango",
      c: "Salsa",
      d: "Merengue"
    },
    correctAnswer: "a",
    backgroundImage: "assets/game-car-question/img/Scenes/parque.png"
  },
  {
    question: "¿En qué departamento se encuentra la Ciudad Perdida?",
    options: {
      a: "Cundinamarca",
      b: "Antioquia",
      c: "Magdalena",
      d: "Boyacá"
    },
    correctAnswer: "c",
    backgroundImage: "assets/game-car-question/img/Scenes/local.png"
  },
  {
    question: "¿Cuál es la bebida típica colombiana elaborada a base de maíz?",
    options: {
      a: "Chicha",
      b: "Aguardiente",
      c: "Masato",
      d: "Café"
    },
    correctAnswer: "a",
    backgroundImage: "assets/game-car-question/img/Scenes/parque.png"
  }
];