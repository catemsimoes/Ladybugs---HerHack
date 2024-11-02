import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Types
type Article = {
  title: string;
  content: string;
  url: string;
  correctTag: Tag;
};

type Tag = 
  | "ALL_CAPS_TITLE"
  | "CLICKBAIT"
  | "EMOTIONAL_LANGUAGE"
  | "UNRELIABLE_SOURCE"
  | "OUTDATED"
  | "TRUTH";

type GameState = 'WAITING' | 'PLAYING' | 'SHOWING_RESULTS';

// Sample data
const TAGS: Tag[] = [
  "ALL_CAPS_TITLE",
  "CLICKBAIT",
  "EMOTIONAL_LANGUAGE",
  "UNRELIABLE_SOURCE",
  "OUTDATED",
  "TRUTH"
];

const ARTICLES: Article[] = [
  {
    title: "SHOCKING: Scientists Find AMAZING Cure for ALL Diseases!",
    content: "In an unprecedented discovery that's sending shockwaves through the medical community, scientists claim they've found a miracle cure that works for every known disease. Click to learn this one weird trick!",
    url: "totally-real-news.com",
    correctTag: "ALL_CAPS_TITLE"
  },
  {
    title: "Local Restaurant Receives Health Inspection Rating",
    content: "Downtown's popular restaurant 'The Hungry Fork' received its annual health inspection this week, maintaining its A rating for the third year in a row.",
    url: "localnews.com",
    correctTag: "TRUTH"
  },
  {
    title: "You Won't BELIEVE What This Celebrity Did Next!",
    content: "In a shocking turn of events that has left fans speechless, this A-list celebrity's latest actions have completely transformed the entertainment industry forever!",
    url: "celebrity-gossip-daily.net",
    correctTag: "CLICKBAIT"
  }
];

const QUESTION_TIME = 30; // in seconds

const formatTag = (tag: Tag) => {
  return tag.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

// Simulated real-time responses
const simulateResponses = (correctTag: Tag) => {
  const totalResponses = Math.floor(Math.random() * 20) + 10; // 10-30 responses
  return TAGS.map(tag => ({
    tag: formatTag(tag),
    count: tag === correctTag 
      ? Math.floor(totalResponses * (0.4 + Math.random() * 0.3)) // 40-70% correct
      : Math.floor(totalResponses * Math.random() * 0.2) // 0-20% for incorrect
  }));
};

const FakeNewsGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [gameState, setGameState] = useState<GameState>('WAITING');
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [responses, setResponses] = useState<Array<{ tag: string; count: number }>>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      if (timeLeft === 1) {
        // Auto-submit when time runs out
        handleTimeUp();
      }

      return () => clearInterval(timer);
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    if (playerName.trim()) {
      setGameState('PLAYING');
      getNextArticle();
      setTotalPlayers(Math.floor(Math.random() * 15) + 5); // 5-20 players
    }
  };

  const getNextArticle = () => {
    const randomIndex = Math.floor(Math.random() * ARTICLES.length);
    setCurrentArticle(ARTICLES[randomIndex]);
    setTimeLeft(QUESTION_TIME);
    setSelectedTag(null);
    setGameState('PLAYING');
  };

  const handleTagClick = (tag: Tag) => {
    setSelectedTag(tag);
  };

  const handleTimeUp = () => {
    if (!currentArticle) return;
    
    setGameState('SHOWING_RESULTS');
    setResponses(simulateResponses(currentArticle.correctTag));
    
    if (selectedTag === currentArticle.correctTag) {
      setScore(score + 1);
    }
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
            {totalPlayers} players waiting to start
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
            <CardTitle>Detective {playerName}</CardTitle>
            <div className="flex items-center gap-4">
              <span>Score: {score}</span>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span className={timeLeft <= 5 ? 'text-red-500' : ''}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentArticle && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FakeNewsGame;