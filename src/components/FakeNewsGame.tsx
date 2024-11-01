import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle } from 'lucide-react';

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

const formatTag = (tag: Tag) => {
  return tag.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

const FakeNewsGame = () => {
  const [playerName, setPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const startGame = () => {
    if (playerName.trim()) {
      setGameStarted(true);
      getNextArticle();
    }
  };

  const getNextArticle = () => {
    const randomIndex = Math.floor(Math.random() * ARTICLES.length);
    setCurrentArticle(ARTICLES[randomIndex]);
    setShowResult(false);
  };

  const handleTagClick = (selectedTag: Tag) => {
    if (!currentArticle) return;
    
    const correct = selectedTag === currentArticle.correctTag;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    setShowResult(true);
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Fake News Detective Game</CardTitle>
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
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Detective {playerName}</span>
            <span>Score: {score}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentArticle && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{currentArticle.title}</h3>
              <p className="text-gray-600">{currentArticle.content}</p>
              <p className="text-sm text-gray-400">Source: {currentArticle.url}</p>
              
              {showResult ? (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className={isCorrect ? 'text-green-600' : 'text-red-600'} />
                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {isCorrect ? 'Correct!' : 'Wrong!'} This article was tagged as: {formatTag(currentArticle.correctTag)}
                    </span>
                  </div>
                  <Button onClick={getNextArticle} className="mt-4">
                    Next Article
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {TAGS.map((tag) => (
                    <Button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      variant="outline"
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