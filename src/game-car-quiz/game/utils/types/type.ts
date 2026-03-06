
export interface Question {
    question: string;
    options: {
      a: string;
      b: string;
      c?: string;
      d?: string;
      e?: string;
      f?: string;
    };
    correctAnswer: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
    backgroundImage?: string;
  }
  