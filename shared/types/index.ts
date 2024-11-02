export type GameState = 'WAITING' | 'PLAYING' | 'SHOWING_RESULTS';

export type Tag = 
  | "ALL_CAPS_TITLE"
  | "CLICKBAIT"
  | "EMOTIONAL_LANGUAGE"
  | "UNRELIABLE_SOURCE"
  | "OUTDATED"
  | "TRUTH";

export type Article = {
    title: string;
    content: string;
    url: string;
    correctTag: Tag;
};

export type Player = {
    id: string;
    name: string;
    score: number;
    answer?: string;
};

export type GameSession = {
    id: string;
    players: Map<string, Player>;
    currentArticle?: Article;
    state: GameState;
    timeLeft: number;
    answers: Map<string, number>;
};