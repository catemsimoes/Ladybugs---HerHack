export type GameState = 'WAITING' | 'PLAYING' | 'SHOWING_RESULTS' | 'GAME_OVER';


export type Tag = 
  | "FAKE:_ALL_CAPS_TITLE"
  | "FAKE:_UNRELIABLE_SOURCE"
  | "TRUTH"
  | "FAKE"; // FAKE is only for the training phase

export type Article = {
    title: string;
    content: string;
    url: string;
    correctTag: Tag;
    clues?: string[]; // Array of clues for training mode
};

export type Player = {
    id: string;
    name: string;
    score: number;
    answer?: string;
};

export type GameMode = 'TRAINING' | 'PLAY';

export type GameSession = {
    id: string;
    players: Map<string, Player>;
    currentArticle?: Article;
    state: GameState;
    mode: GameMode;
    timeLeft: number;
    answers: Map<string, number>;
    round: number;
    libraryHealth: number;
    maxRounds: number;
};