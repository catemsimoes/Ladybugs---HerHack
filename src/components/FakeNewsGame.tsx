import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { GameState, Tag, Article, Player, GameMode } from '@shared/types';


const TAGS: Tag[] = [
  "ALL_CAPS_TITLE",
  "CLICKBAIT",
  "EMOTIONAL_LANGUAGE",
  "UNRELIABLE_SOURCE",
  "OUTDATED",
  "TRUTH"
];

const TIME_IN_SECONDS = 15;
const TIME_IN_MILLISECONDS = TIME_IN_SECONDS * 1000;

const formatTag = (tag: Tag) => {
  return tag.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};


const FakeNewsGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('WAITING');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_IN_SECONDS);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [responses, setResponses] = useState<Array<{ tag: string; count: number }>>([]);
  const [players, setPlayers] = useState<Player[]>([]);
 const [gameMode, setGameMode] = useState<GameMode>('TRAINING');
  const [libraryHealth, setLibraryHealth] = useState(100);
  const [round, setRound] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:3001');

  // Update WebSocket message handler
  wsRef.current.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'joined':
        setPlayerId(data.id);
        setPlayers(data.players);
        break;

      case 'playerJoined':
      case 'playerLeft':
        setPlayers(data.players);
        break;

        case 'gameStart':
        setGameMode(data.gameMode);
        setLibraryHealth(data.libraryHealth);
        setRound(data.round);
        // ... rest of gameStart handling ...
        setGameState('PLAYING');
        setCurrentArticle(data.article);
        setTimeLeft(data.timeLeft);
        setSelectedTag(null);
        setResponses([]);
        break;

        case 'timeUpdate':
          setTimeLeft(data.timeLeft);
        break;

      case 'showResults':
        setGameMode(data.gameMode);
        setLibraryHealth(data.libraryHealth);
        // ... rest of showResults handling ...
        setGameState('SHOWING_RESULTS');
        setResponses(data.results);
        if (selectedTag === data.correctTag) {
          setScore(prevScore => prevScore + 1);
        }
        break;

      case 'gameOver':
        setGameState('GAME_OVER');
        setLibraryHealth(0);
        break;
    }
  };

  wsRef.current.onclose = () => {
    console.log('WebSocket connection closed');
    setTimeout(connectWebSocket, TIME_IN_MILLISECONDS); // Optional: try to reconnect
};
};


if (wsRef.current){
    wsRef.current.onerror = (error) => {
    console.error('WebSocket error:', error);
};
}

const startGame = () => {
if (playerName.trim()) {
  connectWebSocket();
  wsRef.current?.addEventListener('open', () => {
    wsRef.current?.send(JSON.stringify({
      type: 'join',
      name: playerName
    }));
  });
}
};

const handleTagClick = (tag: Tag) => {
if (gameState === 'PLAYING' && !selectedTag) {
  setSelectedTag(tag);
  wsRef.current?.send(JSON.stringify({
    type: 'answer',
    answer: tag
  }));
}
};

const getNextArticle = () => {
// In the WebSocket version, the server controls the game flow
// We just need to tell the server we're ready for the next article
wsRef.current?.send(JSON.stringify({
  type: 'ready'
}));
};

if (gameState === 'WAITING') {
return (
  <Card className="w-full max-w-md mx-auto mt-8">
    <CardHeader>
      <CardTitle>Interactive Fake News Detective</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Input
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <Button 
        className="w-full"
        onClick={startGame}
        disabled={!playerName.trim()}
      >
        Join Game
      </Button>
      <p className="text-center text-sm text-gray-500">
      {players.length} players waiting to start
      </p>
    </CardContent>
  </Card>
);
}

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {gameMode === 'TRAINING' ? 'Training Mode' : 'Save the Library!'}
            </CardTitle>
            <div className="flex items-center gap-4">
              {gameMode === 'TRAINING' ? (
                <span>Score: {score}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Library Health:</span>
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div
                      className="h-full rounded bg-blue-500"
                      style={{ width: `${libraryHealth}%` }}
                    />
                  </div>
                </div>
              )}
              {/* ... rest of header content ... */}
              <span>Score: {score}</span>
                <span>Players: {players.length}</span>
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span className={timeLeft <= 5 ? 'text-red-500' : ''}>
                        {timeLeft}s
                    </span>
                </div>
            </div>
            <div className="mt-4">
            <h4 className="text-sm font-medium">Players:</h4>
            <div className="space-y-1">
                {players.map(player => (
                <div key={player.id} className="text-sm flex justify-between">
                    <span>{player.name}</span>
                    <span>Score: {player.score}</span>
                </div>
                ))}
            </div>
          </div>
          </div>
        </CardHeader>
        <CardContent>
          {gameState === 'GAME_OVER' ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-600">
                The Library of Alexandria has burned down!
              </h2>
              <p>Train more and try again to save the library next time.</p>
              <Button onClick={startGame}>Start New Game</Button>
            </div>
          ) : (
            currentArticle && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{currentArticle.title}</h3>
                <p className="text-gray-600">{currentArticle.content}</p>
                <p className="text-sm text-gray-400">Source: {currentArticle.url}</p>
                
                {gameState === 'SHOWING_RESULTS' ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${selectedTag === currentArticle.correctTag ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={selectedTag === currentArticle.correctTag ? 'text-green-600' : 'text-red-600'} />
                        <span>
                          The correct answer was: {formatTag(currentArticle.correctTag)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={responses}>
                          <XAxis dataKey="tag" angle={-45} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip />
                          <Bar 
                            dataKey="count" 
                            fill="#4f46e5"
                            className="cursor-pointer hover:opacity-80"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <Button onClick={getNextArticle} className="w-full">
                      Next Article
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {TAGS.map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        variant={selectedTag === tag ? 'default' : 'outline'}
                      >
                        {formatTag(tag)}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FakeNewsGame;