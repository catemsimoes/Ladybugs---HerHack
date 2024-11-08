import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { Article, GameMode, GameSession, Player, Tag } from '@shared/types';
import { TRAINING_ARTICLES, PLAY_ARTICLES } from './articles';
import logger from './utils/logger';

type BroadCastData = {
  type: string;
  players?: Player[];
  article?: Article;
  timeLeft?: number;
  results?: {
    tag: string;
    count: number;
  }[];
  correctTag?: Tag;
  gameMode?: GameMode;
  libraryHealth?: number;
  message?: string;
  round?: number;
  totalRounds?: number;
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });


// TODO: Move to shared
const TIME_IN_SECONDS = 15;

const currentGame: GameSession = {
  id: '1',
  players: new Map(),
  state: 'WAITING',
  timeLeft: TIME_IN_SECONDS,
  answers: new Map(),
  mode: 'TRAINING',
  libraryHealth: 100, // Starting health of the Library
  round: 0,
  maxRounds: Math.min(2, TRAINING_ARTICLES.length), // Number of rounds before switching modes
};

const broadcast = (data: BroadCastData) =>  {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Helper function to get random article based on game mode
// const getRandomArticle = (mode: GameMode): Article => {
//   const articles = mode === 'TRAINING' ? TRAINING_ARTICLES : PLAY_ARTICLES;
//   return articles[Math.floor(Math.random() * articles.length)];
// };
// gets the articles one after the other at round x gets the x-th article from the array


// const getRoundArticle = (): Article => {
//   console.log(PLAY_ARTICLES[currentGame.round - currentGame.maxRounds + 1])
//   return currentGame.mode === 'TRAINING'? TRAINING_ARTICLES[currentGame.round]: PLAY_ARTICLES[currentGame.round - 2]; // hack for correct index
// }

const getRoundArticle = (): Article => {
  if (currentGame.mode === 'TRAINING') {
    const index = Math.min(currentGame.round, TRAINING_ARTICLES.length - 1);
    return TRAINING_ARTICLES[index];
  } else {
    const playIndex = currentGame.round - currentGame.maxRounds - 1;
    const safeIndex = Math.min(Math.max(0, playIndex), PLAY_ARTICLES.length - 1);
    return PLAY_ARTICLES[safeIndex];
  }
};

const startGame = () => {
  currentGame.state = 'PLAYING';
  currentGame.timeLeft = TIME_IN_SECONDS;
  currentGame.currentArticle = getRoundArticle();
  currentGame.answers.clear();
  currentGame.round++;

  // Switch to PLAY mode after training rounds
  if (currentGame.round > currentGame.maxRounds && currentGame.mode === 'TRAINING') {
    logger.info('🎮 Switching to PLAY mode...');
    currentGame.mode = 'PLAY';
    currentGame.round = 1;
    currentGame.libraryHealth = 100;
    
    // Broadcast mode change to all players
    broadcast({
      type: 'modeChange',
      gameMode: 'PLAY',
      message: "Training complete! Now let's work together to save the Library of Alexandria!"
    });
  }

  broadcast({
    type: 'gameStart',
    article: currentGame.currentArticle,
    timeLeft: currentGame.timeLeft,
    players: Array.from(currentGame.players.values()),
    gameMode: currentGame.mode,
    libraryHealth: currentGame.libraryHealth,
    round: currentGame.round,
    totalRounds: currentGame.mode === 'TRAINING' ? currentGame.maxRounds : undefined
  });

  startTimer();
}

const startTimer = () => {
  const timer = setInterval(() => {
    currentGame.timeLeft--;
    
    broadcast({
      type: 'timeUpdate',
      timeLeft: currentGame.timeLeft
    });

    if (currentGame.timeLeft <= 0) {
      clearInterval(timer);
      showResults();
    }
  }, 1000);
}

const showResults = () => {
  currentGame.state = 'SHOWING_RESULTS';
  
  const results = Array.from(currentGame.answers.entries()).map(([tag, count]) => ({
    tag,
    count
  }));

  // Find the most voted answer in PLAY mode
  if (currentGame.mode === 'PLAY') {
    // if no one voted, we lose points
    if (results.length === 0) {
      currentGame.libraryHealth = Math.max(0, currentGame.libraryHealth - 15);
    }


    const mostVotedResult = results.reduce((prev, current) => 
      current.count > prev.count ? current : prev, 
      results[0]
    );
    const mostVotedAnswer = mostVotedResult.tag;


    // Update library health based on collective answer
    if (mostVotedAnswer === currentGame.currentArticle?.correctTag) {
      currentGame.libraryHealth = Math.min(100, currentGame.libraryHealth + 10);
    } else {
      currentGame.libraryHealth = Math.max(0, currentGame.libraryHealth - 15);
    }
  }

  // Update individual scores only in training mode
  if (currentGame.mode === 'TRAINING') {
    currentGame.players.forEach((player) => {
      if (player.answer === currentGame.currentArticle?.correctTag) {
        player.score += 1;
      }
    });
  }

  broadcast({
    type: 'showResults',
    results,
    correctTag: currentGame.currentArticle?.correctTag,
    gameMode: currentGame.mode,
    libraryHealth: currentGame.libraryHealth
  });

  // Check if game over
  if (currentGame.mode === 'PLAY' && currentGame.libraryHealth <= 0) {
    broadcast({
      type: 'gameOver',
      libraryHealth: currentGame.libraryHealth
    });
    currentGame.state = 'WAITING';
    currentGame.mode = 'TRAINING';
    currentGame.round = 0;
    currentGame.libraryHealth = 100;
    return;
  }

  // Schedule next round
  setTimeout(startGame, 5000);
}

wss.on('connection', (ws) => {
  logger.info('🐥 New client connected');

  const playerId = Math.random().toString(36).substr(2, 9);
  
  ws.on('message', (message: string) => {
    const data = JSON.parse(message);
    logger.debug('✉️ Received message:', { playerId, type: data.type });

    switch (data.type) {
      case 'join':
        currentGame.players.set(playerId, {
          id: playerId,
          name: data.name,
          score: 0
        });
        logger.info(`🐥 Player joined: ${data.name}`, { 
          playerId,
          totalPlayers: currentGame.players.size 
        })
      
        ws.send(JSON.stringify({
          type: 'joined',
          id: playerId,
          players: Array.from(currentGame.players.values()),
          gameMode: currentGame.mode,
          round: currentGame.round,
          totalRounds: currentGame.mode === 'TRAINING' ? currentGame.maxRounds : undefined,
          libraryHealth: currentGame.libraryHealth
        }));

        broadcast({
          type: 'playerJoined',
          players: Array.from(currentGame.players.values())
        });

        if (currentGame.players.size >= 2 && currentGame.state === 'WAITING') {
          logger.info('🎮 Starting game in training mode...')
          setTimeout(startGame, 3000); // three seconds and the game starts!
        }
        break;

        case 'answer':
          if (currentGame.state === 'PLAYING') {
            logger.debug(`Player ${playerId} answered`, { 
              answer: data.answer 
            });
            const player = currentGame.players.get(playerId);
            if (player) {
              player.answer = data.answer;
              currentGame.answers.set(
                data.answer,
                (currentGame.answers.get(data.answer) || 0) + 1
              );
            }
          }
          break;
        }
  });

  ws.on('close', () => {
    currentGame.players.delete(playerId);
    broadcast({
      type: 'playerLeft',
      players: Array.from(currentGame.players.values())
    });
    logger.info(`👋🏻 Player disconnected`, { 
      playerId,
      remainingPlayers: currentGame.players.size - 1 
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});