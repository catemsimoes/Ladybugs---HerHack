import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { Article, GameSession, Player, Tag } from '@shared/types';
import { ARTICLES } from './articles';
import logger from './utils/logger';

type BroadCastData = {
  type: string;
  players?: Player[];
  article?: Article;
  timeLeft?: number;
  results?:  {
    tag: string;
    count: number;
}[];
  correctTag?: Tag;
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
  answers: new Map()
};

const broadcast = (data: BroadCastData) =>  {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

const startGame = () => {
  currentGame.state = 'PLAYING';
  currentGame.timeLeft = TIME_IN_SECONDS;
  currentGame.currentArticle = ARTICLES[Math.floor(Math.random() * ARTICLES.length)];
  currentGame.answers.clear();

  broadcast({
    type: 'gameStart',
    article: currentGame.currentArticle,
    timeLeft: currentGame.timeLeft,
    players: Array.from(currentGame.players.values())
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

const showResults= () => {
  currentGame.state = 'SHOWING_RESULTS';
  
  const results = Array.from(currentGame.answers.entries()).map(([tag, count]) => ({
    tag,
    count
  }));

  broadcast({
    type: 'showResults',
    results,
    correctTag: currentGame.currentArticle?.correctTag
  });

  // Update scores
  currentGame.players.forEach((player) => {
    if (player.answer === currentGame.currentArticle?.correctTag) {
      player.score += 1;
    }
  });

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
          players: Array.from(currentGame.players.values())
        }));

        broadcast({
          type: 'playerJoined',
          players: Array.from(currentGame.players.values())
        });

        if (currentGame.players.size >= 2 && currentGame.state === 'WAITING') {
          logger.info('🎮 Starting game...')
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