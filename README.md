# Ladybugs---HerHack 
This app is going to gameify media literacy for children in classroooms. They will learn principles that will help them discern whether or not a news article is real or fake, which will let them accumulate points to win the game later on. 

This app will be called Smell the Fake


```markdown
# Setup Instructions

1. Create a new Vite project with React and TypeScript:
```bash
npm create vite@latest . -- --template react-ts
npm install
```

2. Install Tailwind CSS and its dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Install additional dependencies:
```bash
npm install lucide-react
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure
```
your-repo/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   └── FakeNewsGame.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Development

The app is a simple game where players:
1. Enter their name to start
2. View random news articles
3. Choose whether they think each article is real or fake based on different criteria
4. Get immediate feedback and track their score
```

Would you like me to add:
1. More details about any specific part?
2. Information about the game mechanics?
3. Instructions for adding new articles or tags?