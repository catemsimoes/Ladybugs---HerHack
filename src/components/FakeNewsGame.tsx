import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { GameState, Tag, Article, Player, GameMode } from '@shared/types';


const PLAYING_TAGS: Tag[] = [
  "FAKE:_ALL_CAPS_TITLE",
  "FAKE:_UNRELIABLE_SOURCE",
  "TRUTH",
];

const TRAINING_TAGS = [
  "TRUTH",
  "FAKE"
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
  <Card className="w-full max-w-md mx-auto mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
    <CardHeader className="text-center pb-2 border-b border-amber-200">
      <CardTitle className="text-3xl font-bold text-amber-900">
        <div className="space-y-2">
          <div className="text-4xl">🔥 Fireproof Facts 🔥</div>
          <div className="text-lg font-normal text-amber-700 mt-2">
            Save the Library of Alexandria!
          </div>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 pt-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-amber-800">
          Enter Your Name, Young Scholar
        </label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="border-2 border-amber-200 bg-white placeholder:text-amber-300 text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>
      <Button 
        className={`w-full h-12 text-lg font-medium transition-all duration-300 ${
          playerName.trim() 
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg' 
            : 'bg-amber-100 text-amber-600'
        }`}
        onClick={startGame}
        disabled={!playerName.trim()}
      >
        Join the Quest
      </Button>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-amber-700">
          {players.length} scholar{players.length !== 1 ? 's' : ''} waiting to start
        </p>
        {players.length > 0 && (
          <p className="text-xs text-amber-600 italic">
            The quest begins when at least 2 scholars join
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);
}

return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <CardHeader className="border-b border-amber-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-amber-900 flex items-center gap-2 text-2xl">
              {gameMode === 'TRAINING' ? (
                <>
                  <span>📚 Training at Alexandria</span>
                </>
              ) : (
                <>
                  <span>🔥 Save the Library! 📚</span>
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-4">
              {gameMode === 'TRAINING' ? (
                <span className="text-amber-700 font-semibold">Practice Mode</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-amber-800">Library Health:</span>
                  <div className="w-32 h-3 bg-amber-100 rounded-full border border-amber-300">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${libraryHealth}%` }}
                    />
                  </div>
                </div>
              )}
              <span className="text-amber-700 font-medium">Players: {players.length}</span>
              <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full">
                <Timer className="w-4 h-4 text-amber-700" />
                <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-amber-700'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {gameState === 'GAME_OVER' ? (
            <div className="text-center space-y-4 p-8 bg-red-50 rounded-lg border-2 border-red-200">
              <h2 className="text-3xl font-bold text-red-800">
                The Library of Alexandria has burned down!
              </h2>
              <p className="text-red-600">Train more and try again to save the library next time.</p>
              <Button 
                onClick={startGame}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Start New Game
              </Button>
            </div>
          ) : (
            currentArticle && (
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg border-2 border-amber-200 shadow-sm">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">{currentArticle.title}</h3>
                  <p className="text-amber-800">{currentArticle.content}</p>
                  <p className="text-sm text-amber-600 mt-4 italic">Source: {currentArticle.url}</p>
                </div>
                
                {gameState === 'SHOWING_RESULTS' ? (
                  <div className="space-y-4">
                    <div 
                      className={`p-6 rounded-lg border-2 shadow-sm ${
                        selectedTag === currentArticle.correctTag 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <AlertCircle className={
                          selectedTag === currentArticle.correctTag 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        } />
                        <span className="font-medium">
                          The correct answer was: {formatTag(currentArticle.correctTag)}
                        </span>
                      </div>
                    </div>
  
                    {gameMode === 'TRAINING' && currentArticle.clues && (
                      <div className="p-6 bg-amber-50 rounded-lg border-2 border-amber-200 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                          <span>🔍 Detective Notes:</span>
                        </h4>
                        <ul className="list-none space-y-2">
                          {currentArticle.clues.map((clue, index) => (
                            <li key={index} className="text-amber-800 flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              {clue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
  
  <div className="h-64 w-full bg-white p-4 rounded-lg border-2 border-amber-200 shadow-sm">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart 
      data={responses.map(response => ({
        ...response,
        formattedTag: formatTag(response.tag) // Add formatted version of tag
      }))}
    >
      <XAxis 
        dataKey="formattedTag" 
        angle={-45} 
        textAnchor="end" 
        height={60}
        tick={{ fill: '#92400e' }} // amber-800 for better readability
      />
      <YAxis />
      <Tooltip 
        formatter={(value) => [value, 'Votes']} // Customize tooltip text
        labelFormatter={(label) => `Answer: ${label}`} // Format the label in tooltip
      />
      <Bar 
        dataKey="count" 
        fill="#d97706" // amber-600
        className="cursor-pointer hover:opacity-80"
        name="Votes" // This will show in the tooltip
      />
    </BarChart>
  </ResponsiveContainer>
</div>
  
                    <Button 
                      onClick={getNextArticle} 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Next Article
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {(gameMode === 'TRAINING' ? TRAINING_TAGS : PLAYING_TAGS).map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        variant={selectedTag === tag ? 'default' : 'outline'}
                        className={`
                          ${selectedTag === tag 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                          }
                          p-4 h-auto font-medium transition-colors
                        `}
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