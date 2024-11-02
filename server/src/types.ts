export type GameState = 'WAITING' | 'PLAYING' | 'SHOWING_RESULTS';

export type Player = {
  id: string;
  name: string;
  score: number;
  answer?: string;
};

export type Article = {
  title: string;
  content: string;
  url: string;
  correctTag: string;
};

export type GameSession = {
  id: string;
  players: Map<string, Player>;
  currentArticle?: Article;
  state: GameState;
  timeLeft: number;
  answers: Map<string, number>;
};

