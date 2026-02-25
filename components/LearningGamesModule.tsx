import React, { useState, useEffect, useMemo } from 'react';
import { User, GameType, GameScore } from '../types';
import { Gamepad2, BarChart3, Trophy, Clock, Target, ArrowRight, RotateCcw } from 'lucide-react';
import { saveDoc, listDocs } from '../services/firebaseService';

interface LearningGamesModuleProps {
  currentUser: User;
}

// Grade-adjusted difficulty configs
const MATH_DIFFICULTY = {
  '1': { operations: ['+'], max: 10, questions: 8, timeLimit: 120 },
  '2': { operations: ['+', '-'], max: 20, questions: 10, timeLimit: 100 },
  '3': { operations: ['+', '-'], max: 50, questions: 12, timeLimit: 90 },
  '4': { operations: ['+', '-', '*'], max: 100, questions: 15, timeLimit: 80 },
  '5': { operations: ['+', '-', '*', '/'], max: 200, questions: 15, timeLimit: 75 },
  '6': { operations: ['+', '-', '*', '/'], max: 500, questions: 18, timeLimit: 70 },
  '7': { operations: ['+', '-', '*', '/'], max: 1000, questions: 20, timeLimit: 65 },
  '8': { operations: ['+', '-', '*', '/', '%'], max: 2000, questions: 20, timeLimit: 60 },
  '9': { operations: ['+', '-', '*', '/', '%', '^'], max: 5000, questions: 25, timeLimit: 55 },
  '10': { operations: ['+', '-', '*', '/', '%', '^'], max: 10000, questions: 25, timeLimit: 50 },
  '11': { operations: ['+', '-', '*', '/', '%', '^'], max: 100000, questions: 30, timeLimit: 50 },
  '12': { operations: ['+', '-', '*', '/', '%', '^'], max: 100000, questions: 30, timeLimit: 50 },
};

const ENGLISH_VOCABULARY = {
  '1': ['cat', 'dog', 'ball', 'book', 'apple', 'house', 'tree', 'bird'],
  '2': ['happy', 'quickly', 'beautiful', 'wonderful', 'friend', 'family', 'school', 'teacher'],
  '3': ['adventure', 'important', 'different', 'understand', 'remember', 'discovery', 'example'],
  '4': ['literature', 'paragraph', 'vocabulary', 'grammar', 'dialogue', 'summary', 'character'],
  '5': ['eloquent', 'narrative', 'symbolism', 'metaphor', 'analysis', 'conclusion', 'perspective'],
  '6': ['sophisticated', 'narrative', 'literature', 'analysis', 'structure', 'technique', 'interpretation'],
  '7': ['juxtaposition', 'ambiguity', 'rhetoric', 'inference', 'deduction', 'synthesis', 'evaluation'],
  '8': ['pragmatism', 'semantics', 'linguistics', 'syntax', 'discourse', 'methodology', 'hypothesis'],
  '9': ['ontology', 'epistemology', 'phenomenology', 'existential', 'dialectic', 'paradigm', 'aesthetic'],
  '10': ['hermeneutics', 'deconstruction', 'postmodern', 'hegemony', 'dichotomy', 'paradigm', 'archetype'],
  '11': ['epistemological', 'phenomenological', 'existentialist', 'dialectical', 'cosmological', 'teleological'],
  '12': ['metaphysical', 'hermeneutics', 'deconstruction', 'semiotics', 'phenomenological', 'existential'],
};

const AFRIKAANS_WORDS = {
  '1': { words: ['hallo', 'goeie', 'môre', 'dankie', 'asseblief'], sentences: ['Hallo, hoe gaan dit?'] },
  '2': { words: ['skool', 'boek', 'pen', 'tafel', 'stoel'], sentences: ['Ek gaan na die skool.'] },
  '3': { words: ['vriende', 'speel', 'lees', 'skryf', 'luister'], sentences: ['Ons vriende speel saam.'] },
  '4': { words: ['belangrik', 'verstaan', 'leer', 'werk', 'geniet'], sentences: ['Dit is baie belangrik.'] },
  '5': { words: ['natuurlik', 'voorkeur', 'sê', 'voel', 'dink'], sentences: ['Natuurlik kan ek dit doen.'] },
  '6': { words: ['kommunikasie', 'verskil', 'kultuur', 'tradisie', 'waarde'], sentences: ['Kommunikasie is baie belangrik.'] },
  '7': { words: ['filosofie', 'bewustheid', 'perspektief', 'standpunt', 'begrip'], sentences: ['Jy het \'n aangete perspektief.'] },
  '8': { words: ['metafoor', 'simboliek', 'retoriek', 'semantiek', 'konteks'], sentences: ['Die metafoor het diep betekenis.'] },
  '9': { words: ['existensieel', 'dialektiek', 'paradigma', 'fenomenologie', 'epistemologie'] },
  '10': { words: ['hermeneutiek', 'dekonstruksie', 'postmodern', 'hegemonie', 'antitese'] },
  '11': { words: ['metafisies', 'ontologiese', 'erkennisuiteoreties', 'fenomenologiese', 'eksistensiële'] },
  '12': { words: ['semiotiek', 'dekonstruktief', 'hermeneuties', 'epistemologies', 'kosmologiese'] },
};

const XHOSA_WORDS = {
  '1': { words: ['molo', 'enkosi', 'wena', 'nna', 'uba'], sentences: ['Molo ndoda!'] },
  '2': { words: ['isikolo', 'ibhafu', 'itafile', 'abantwana', 'ubusi'], sentences: ['Ndiya nisikolo.'] },
  '3': { words: ['umculo', 'ulala', 'ukutya', 'umntu', 'ihlwele'], sentences: ['Abantwana beyakuzonwabisa.'] },
  '4': { words: ['ixesha', 'iimpilo', 'intetho', 'iintaba', 'iindlu'], sentences: ['Ixesha liyaqhaqhaza.'] },
  '5': { words: ['ubudlelwane', 'imizamo', 'ingxaki', 'inzala', 'izinto'], sentences: ['Ubudlelwane bubalulekile.'] },
  '6': { words: ['ukuthola', 'isikhokhi', 'iintloko', 'amasiko', 'isiZulu'], sentences: ['Amasiko asemanzini.'] },
  '7': { words: ['umlumanzi', 'iingcali', 'inqwando', 'imfihlelo', 'ithemba'], sentences: ['Ithemba liyamangala.'] },
  '8': { words: ['ubuhlobo', 'izikhundla', 'indlela', 'umthunzi', 'isichazi'], sentences: ['Isichazi-magama seyolo.'] },
  '9': { words: ['inqalo', 'isikhephu', 'isiphiwo', 'iintlantle', 'umkhulu'] },
  '10': { words: ['isifundo', 'ibange', 'ipholisi', 'ingcamango', 'isihloni'] },
  '11': { words: ['iimvakalelo', 'isikhumbulo', 'ubuminzane', 'indlaleko', 'umzabalazo'] },
  '12': { words: ['iinkcukacha', 'inqwelo-mbangazo', 'isi-Xhosa', 'umngeni', 'isiphakamiso'] },
};

const LearningGamesModule: React.FC<LearningGamesModuleProps> = ({ currentUser }) => {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState(false);
  const [leaderboards, setLeaderboards] = useState<Record<string, GameScore[]>>({});
  
  // Math game state
  const [mathQuestionIndex, setMathQuestionIndex] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [mathCorrectCount, setMathCorrectCount] = useState(0);
  const [mathTimeLeft, setMathTimeLeft] = useState(0);
  const [mathQuestions, setMathQuestions] = useState<Array<{ a: number; b: number; op: string; answer: number }>>([]);
  
  // English game state
  const [englishQuestionIndex, setEnglishQuestionIndex] = useState(0);
  const [englishScore, setEnglishScore] = useState(0);
  const [englishCorrectCount, setEnglishCorrectCount] = useState(0);
  const [englishTimeLeft, setEnglishTimeLeft] = useState(0);
  const [englishQuestions, setEnglishQuestions] = useState<string[]>([]);

  // Afrikaans game state
  const [afrikaansQuestionIndex, setAfrikaansQuestionIndex] = useState(0);
  const [afrikaansScore, setAfrikaansScore] = useState(0);
  const [afrikaansCorrectCount, setAfrikaansCorrectCount] = useState(0);
  const [afrikaansTimeLeft, setAfrikaansTimeLeft] = useState(0);
  const [afrikaansQuestions, setAfrikaansQuestions] = useState<string[]>([]);

  // Xhosa game state
  const [xhosaQuestionIndex, setXhosaQuestionIndex] = useState(0);
  const [xhosaScore, setXhosaScore] = useState(0);
  const [xhosaCorrectCount, setXhosaCorrectCount] = useState(0);
  const [xhosaTimeLeft, setXhosaTimeLeft] = useState(0);
  const [xhosaQuestions, setXhosaQuestions] = useState<string[]>([]);

  const userGrade = currentUser.grade || '1';
  const mathConfig = MATH_DIFFICULTY[userGrade as keyof typeof MATH_DIFFICULTY] || MATH_DIFFICULTY['1'];

  // Generate math questions
  const generateMathQuestions = () => {
    const questions = [];
    for (let i = 0; i < mathConfig.questions; i++) {
      const op = mathConfig.operations[Math.floor(Math.random() * mathConfig.operations.length)];
      const a = Math.floor(Math.random() * mathConfig.max);
      const b = Math.floor(Math.random() * mathConfig.max);
      
      let answer = 0;
      if (op === '+') answer = a + b;
      else if (op === '-') answer = Math.abs(a - b);
      else if (op === '*') answer = a * b > mathConfig.max ? Math.floor(Math.random() * mathConfig.max) : a * b;
      else if (op === '/') answer = b === 0 ? a : Math.floor(a / b);
      else if (op === '%') answer = b === 0 ? a : a % b;
      else if (op === '^') answer = a < 100 ? Math.pow(a, b < 3 ? b : 2) : a;
      
      questions.push({ a, b, op, answer });
    }
    return questions;
  };

  const startMathGame = () => {
    const questions = generateMathQuestions();
    setMathQuestions(questions);
    setMathQuestionIndex(0);
    setMathScore(0);
    setMathCorrectCount(0);
    setMathTimeLeft(mathConfig.timeLimit);
    setGameActive(true);
    setCurrentGame(GameType.MATH_BLITZ);
  };

  const startEnglishGame = () => {
    const vocabList = ENGLISH_VOCABULARY[userGrade as keyof typeof ENGLISH_VOCABULARY] || ENGLISH_VOCABULARY['1'];
    setEnglishQuestionIndex(0);
    setEnglishScore(0);
    setEnglishCorrectCount(0);
    setEnglishTimeLeft(120);
    setEnglishQuestions(vocabList);
    setGameActive(true);
    setCurrentGame(GameType.ENGLISH_VOCAB);
  };

  const startAfrikaansGame = () => {
    const vocabData = AFRIKAANS_WORDS[userGrade as keyof typeof AFRIKAANS_WORDS] || AFRIKAANS_WORDS['1'];
    setAfrikaansQuestionIndex(0);
    setAfrikaansScore(0);
    setAfrikaansCorrectCount(0);
    setAfrikaansTimeLeft(120);
    setAfrikaansQuestions(vocabData.words);
    setGameActive(true);
    setCurrentGame(GameType.AFRIKAANS_BUILDER);
  };

  const startXhosaGame = () => {
    const vocabData = XHOSA_WORDS[userGrade as keyof typeof XHOSA_WORDS] || XHOSA_WORDS['1'];
    setXhosaQuestionIndex(0);
    setXhosaScore(0);
    setXhosaCorrectCount(0);
    setXhosaTimeLeft(120);
    setXhosaQuestions(vocabData.words);
    setGameActive(true);
    setCurrentGame(GameType.XHOSA_BUILDER);
  };

  // Math game timer
  useEffect(() => {
    if (!gameActive || currentGame !== GameType.MATH_BLITZ || mathTimeLeft <= 0) return;
    const timer = setTimeout(() => setMathTimeLeft(mathTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [mathTimeLeft, gameActive, currentGame]);

  useEffect(() => {
    if (mathTimeLeft === 0 && gameActive && currentGame === GameType.MATH_BLITZ) {
      endMathGame();
    }
  }, [mathTimeLeft]);

  // English game timer
  useEffect(() => {
    if (!gameActive || currentGame !== GameType.ENGLISH_VOCAB || englishTimeLeft <= 0) return;
    const timer = setTimeout(() => setEnglishTimeLeft(englishTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [englishTimeLeft, gameActive, currentGame]);

  useEffect(() => {
    if (englishTimeLeft === 0 && gameActive && currentGame === GameType.ENGLISH_VOCAB) {
      endEnglishGame();
    }
  }, [englishTimeLeft]);

  // Afrikaans game timer
  useEffect(() => {
    if (!gameActive || currentGame !== GameType.AFRIKAANS_BUILDER || afrikaansTimeLeft <= 0) return;
    const timer = setTimeout(() => setAfrikaansTimeLeft(afrikaansTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [afrikaansTimeLeft, gameActive, currentGame]);

  useEffect(() => {
    if (afrikaansTimeLeft === 0 && gameActive && currentGame === GameType.AFRIKAANS_BUILDER) {
      endAfrikaansGame();
    }
  }, [afrikaansTimeLeft]);

  // Xhosa game timer
  useEffect(() => {
    if (!gameActive || currentGame !== GameType.XHOSA_BUILDER || xhosaTimeLeft <= 0) return;
    const timer = setTimeout(() => setXhosaTimeLeft(xhosaTimeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [xhosaTimeLeft, gameActive, currentGame]);

  useEffect(() => {
    if (xhosaTimeLeft === 0 && gameActive && currentGame === GameType.XHOSA_BUILDER) {
      endXhosaGame();
    }
  }, [xhosaTimeLeft]);

  const handleMathAnswer = (selected: number) => {
    const question = mathQuestions[mathQuestionIndex];
    if (selected === question.answer) {
      setMathCorrectCount(mathCorrectCount + 1);
      setMathScore(mathScore + 100 + mathTimeLeft);
    }
    
    if (mathQuestionIndex < mathQuestions.length - 1) {
      setMathQuestionIndex(mathQuestionIndex + 1);
    } else {
      endMathGame();
    }
  };

  const endMathGame = async () => {
    setGameActive(false);
    const accuracy = mathQuestions.length > 0 ? Math.round((mathCorrectCount / mathQuestions.length) * 100) : 0;
    const elapsedTime = mathConfig.timeLimit - mathTimeLeft;

    const gameScore: GameScore = {
      id: Date.now().toString(),
      gameType: GameType.MATH_BLITZ,
      subject: 'Mathematics',
      schoolId: currentUser.schoolId || '',
      grade: userGrade,
      playerId: currentUser.id,
      playerName: currentUser.name,
      score: mathScore,
      accuracy,
      questionsAnswered: mathQuestions.length,
      correctAnswers: mathCorrectCount,
      timeSpent: elapsedTime,
      difficulty: userGrade,
      timestamp: Date.now(),
    };

    try {
      await saveDoc('gameScores', gameScore.id, gameScore);
      alert(`Game Over! Score: ${mathScore} | Accuracy: ${accuracy}%`);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const handleEnglishAnswer = (correct: boolean) => {
    if (correct) {
      setEnglishCorrectCount(englishCorrectCount + 1);
      setEnglishScore(englishScore + 100 + englishTimeLeft);
    }

    if (englishQuestionIndex < englishQuestions.length - 1) {
      setEnglishQuestionIndex(englishQuestionIndex + 1);
    } else {
      endEnglishGame();
    }
  };

  const endEnglishGame = async () => {
    setGameActive(false);
    const accuracy = englishQuestions.length > 0 ? Math.round((englishCorrectCount / englishQuestions.length) * 100) : 0;
    const elapsedTime = 120 - englishTimeLeft;

    const gameScore: GameScore = {
      id: Date.now().toString(),
      gameType: GameType.ENGLISH_VOCAB,
      subject: 'English',
      schoolId: currentUser.schoolId || '',
      grade: userGrade,
      playerId: currentUser.id,
      playerName: currentUser.name,
      score: englishScore,
      accuracy,
      questionsAnswered: englishQuestions.length,
      correctAnswers: englishCorrectCount,
      timeSpent: elapsedTime,
      difficulty: userGrade,
      timestamp: Date.now(),
    };

    try {
      await saveDoc('gameScores', gameScore.id, gameScore);
      alert(`Game Over! Score: ${englishScore} | Accuracy: ${accuracy}%`);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const handleAfrikaansAnswer = (correct: boolean) => {
    if (correct) {
      setAfrikaansCorrectCount(afrikaansCorrectCount + 1);
      setAfrikaansScore(afrikaansScore + 100 + afrikaansTimeLeft);
    }

    if (afrikaansQuestionIndex < afrikaansQuestions.length - 1) {
      setAfrikaansQuestionIndex(afrikaansQuestionIndex + 1);
    } else {
      endAfrikaansGame();
    }
  };

  const endAfrikaansGame = async () => {
    setGameActive(false);
    const accuracy = afrikaansQuestions.length > 0 ? Math.round((afrikaansCorrectCount / afrikaansQuestions.length) * 100) : 0;
    const elapsedTime = 120 - afrikaansTimeLeft;

    const gameScore: GameScore = {
      id: Date.now().toString(),
      gameType: GameType.AFRIKAANS_BUILDER,
      subject: 'Afrikaans',
      schoolId: currentUser.schoolId || '',
      grade: userGrade,
      playerId: currentUser.id,
      playerName: currentUser.name,
      score: afrikaansScore,
      accuracy,
      questionsAnswered: afrikaansQuestions.length,
      correctAnswers: afrikaansCorrectCount,
      timeSpent: elapsedTime,
      difficulty: userGrade,
      timestamp: Date.now(),
    };

    try {
      await saveDoc('gameScores', gameScore.id, gameScore);
      alert(`Game Over! Score: ${afrikaansScore} | Accuracy: ${accuracy}%`);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const handleXhosaAnswer = (correct: boolean) => {
    if (correct) {
      setXhosaCorrectCount(xhosaCorrectCount + 1);
      setXhosaScore(xhosaScore + 100 + xhosaTimeLeft);
    }

    if (xhosaQuestionIndex < xhosaQuestions.length - 1) {
      setXhosaQuestionIndex(xhosaQuestionIndex + 1);
    } else {
      endXhosaGame();
    }
  };

  const endXhosaGame = async () => {
    setGameActive(false);
    const accuracy = xhosaQuestions.length > 0 ? Math.round((xhosaCorrectCount / xhosaQuestions.length) * 100) : 0;
    const elapsedTime = 120 - xhosaTimeLeft;

    const gameScore: GameScore = {
      id: Date.now().toString(),
      gameType: GameType.XHOSA_BUILDER,
      subject: 'Xhosa',
      schoolId: currentUser.schoolId || '',
      grade: userGrade,
      playerId: currentUser.id,
      playerName: currentUser.name,
      score: xhosaScore,
      accuracy,
      questionsAnswered: xhosaQuestions.length,
      correctAnswers: xhosaCorrectCount,
      timeSpent: elapsedTime,
      difficulty: userGrade,
      timestamp: Date.now(),
    };

    try {
      await saveDoc('gameScores', gameScore.id, gameScore);
      alert(`Game Over! Score: ${xhosaScore} | Accuracy: ${accuracy}%`);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  if (leaderboardView) {
    return <GameLeaderboardView currentUser={currentUser} onBack={() => setLeaderboardView(false)} />;
  }

  if (gameActive && currentGame === GameType.MATH_BLITZ && mathQuestions.length > 0) {
    const question = mathQuestions[mathQuestionIndex];
    const wrongAnswers = [question.answer + 1, question.answer + 5, question.answer - 3]
      .filter(n => n !== question.answer && n > 0)
      .slice(0, 3);
    const allAnswers = [...wrongAnswers, question.answer].sort(() => Math.random() - 0.5);

    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2.5rem] shadow-2xl p-10 text-white mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">Math Blitz</h2>
              <p className="text-blue-100">Question {mathQuestionIndex + 1} of {mathQuestions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black mb-2">{mathScore}</div>
              <p className="text-blue-100">Points</p>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-blue-100 text-sm">Time Left</p>
                <p className="text-3xl font-black">{mathTimeLeft}s</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <div>
                <p className="text-blue-100 text-sm">Correct</p>
                <p className="text-3xl font-black">{mathCorrectCount}/{mathQuestions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-8 border-4 border-white/30">
            <p className="text-6xl font-black text-center">
              {question.a} {question.op} {question.b} = ?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {allAnswers.map((answer, idx) => (
            <button
              key={idx}
              onClick={() => handleMathAnswer(answer)}
              className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all font-black text-4xl text-blue-600 active:scale-95 shadow-lg"
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameActive && currentGame === GameType.ENGLISH_VOCAB && englishQuestions.length > 0) {
    const currentWord = englishQuestions[englishQuestionIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-[2.5rem] shadow-2xl p-10 text-white mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">English Vocabulary</h2>
              <p className="text-green-100">Question {englishQuestionIndex + 1} of {englishQuestions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black mb-2">{englishScore}</div>
              <p className="text-green-100">Points</p>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-green-100 text-sm">Time Left</p>
                <p className="text-3xl font-black">{englishTimeLeft}s</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <div>
                <p className="text-green-100 text-sm">Correct</p>
                <p className="text-3xl font-black">{englishCorrectCount}/{englishQuestions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-8 border-4 border-white/30">
            <p className="text-6xl font-black text-center">{currentWord}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handleEnglishAnswer(true)}
            className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-green-600 hover:bg-green-50 transition-all font-black text-3xl text-green-600 active:scale-95 shadow-lg"
          >
            ✓ Correct
          </button>
          <button
            onClick={() => handleEnglishAnswer(false)}
            className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-red-600 hover:bg-red-50 transition-all font-black text-3xl text-red-600 active:scale-95 shadow-lg"
          >
            ✗ Skip
          </button>
        </div>
      </div>
    );
  }

  if (gameActive && currentGame === GameType.AFRIKAANS_BUILDER && afrikaansQuestions.length > 0) {
    const currentWord = afrikaansQuestions[afrikaansQuestionIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-[2.5rem] shadow-2xl p-10 text-white mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">Afrikaans Word Builder</h2>
              <p className="text-amber-100">Question {afrikaansQuestionIndex + 1} of {afrikaansQuestions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black mb-2">{afrikaansScore}</div>
              <p className="text-amber-100">Points</p>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-amber-100 text-sm">Time Left</p>
                <p className="text-3xl font-black">{afrikaansTimeLeft}s</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <div>
                <p className="text-amber-100 text-sm">Correct</p>
                <p className="text-3xl font-black">{afrikaansCorrectCount}/{afrikaansQuestions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-8 border-4 border-white/30">
            <p className="text-6xl font-black text-center">{currentWord}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handleAfrikaansAnswer(true)}
            className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-amber-600 hover:bg-amber-50 transition-all font-black text-3xl text-amber-600 active:scale-95 shadow-lg"
          >
            ✓ Correct
          </button>
          <button
            onClick={() => handleAfrikaansAnswer(false)}
            className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-red-600 hover:bg-red-50 transition-all font-black text-3xl text-red-600 active:scale-95 shadow-lg"
          >
            ✗ Skip
          </button>
        </div>
      </div>
    );
  }

  if (gameActive && currentGame === GameType.XHOSA_BUILDER && xhosaQuestions.length > 0) {
    const currentWord = xhosaQuestions[xhosaQuestionIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-[2.5rem] shadow-2xl p-10 text-white mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">Xhosa Word Builder</h2>
              <p className="text-red-100">Question {xhosaQuestionIndex + 1} of {xhosaQuestions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black mb-2">{xhosaScore}</div>
              <p className="text-red-100">Points</p>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-red-100 text-sm">Time Left</p>
                <p className="text-3xl font-black">{xhosaTimeLeft}s</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <div>
                <p className="text-red-100 text-sm">Correct</p>
                <p className="text-3xl font-black">{xhosaCorrectCount}/{xhosaQuestions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-8 border-4 border-white/30">
            <p className="text-6xl font-black text-center">{currentWord}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handleXhosaAnswer(true)}
            className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-red-600 hover:bg-red-50 transition-all font-black text-3xl text-red-600 active:scale-95 shadow-lg"
          >
            ✓ Correct
          </button>
          <button
            onClick={() => handleXhosaAnswer(false)}
            className="p-8 bg-white rounded-2xl border-4 border-slate-200 hover:border-red-600 hover:bg-red-50 transition-all font-black text-3xl text-red-600 active:scale-95 shadow-lg"
          >
            ✗ Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Gamepad2 className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Learning Games</h2>
      </div>

      <button onClick={() => setLeaderboardView(true)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
        <Trophy className="w-5 h-5" /> Leaderboards
      </button>

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">Master English, Mathematics & Afrikaans</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Math Blitz Game Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2.5rem] border-2 border-blue-200 p-10 hover:shadow-2xl transition-all">
          <div className="mb-6 p-5 bg-blue-600 rounded-2xl inline-block text-white">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-blue-900 mb-3">Math Blitz</h3>
          <p className="text-blue-700 text-sm mb-6">Timed math challenges tailored to Grade {userGrade}. Answer {mathConfig.questions} questions in {mathConfig.timeLimit} seconds!</p>
          <div className="bg-white/60 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <p><strong>Operations:</strong> {mathConfig.operations.join(', ')}</p>
            <p><strong>Max Number:</strong> {mathConfig.max}</p>
            <p><strong>Questions:</strong> {mathConfig.questions}</p>
            <p><strong>Time Limit:</strong> {mathConfig.timeLimit}s</p>
          </div>
          <button onClick={startMathGame} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
            Start Game <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* English Vocabulary Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-[2.5rem] border-2 border-green-200 p-10 hover:shadow-2xl transition-all">
          <div className="mb-6 p-5 bg-green-600 rounded-2xl inline-block text-white">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-green-900 mb-3">English Vocabulary</h3>
          <p className="text-green-700 text-sm mb-6">Build vocabulary skills with word challenges. Match definitions and expand your English mastery.</p>
          <div className="bg-white/60 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <p><strong>Grade Level:</strong> {userGrade}</p>
            <p><strong>Focus:</strong> Vocabulary & Spelling</p>
            <p><strong>Questions:</strong> {englishQuestions.length || 15}</p>
            <p><strong>Time Limit:</strong> 120s</p>
          </div>
          <button onClick={startEnglishGame} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
            Start Game <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Afrikaans Builder Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-[2.5rem] border-2 border-amber-200 p-10 hover:shadow-2xl transition-all">
          <div className="mb-6 p-5 bg-amber-600 rounded-2xl inline-block text-white">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-amber-900 mb-3">Afrikaans Word Builder</h3>
          <p className="text-amber-700 text-sm mb-6">Master Afrikaans by constructing sentences and learning vocabulary at your level.</p>
          <div className="bg-white/60 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <p><strong>Grade Level:</strong> {userGrade}</p>
            <p><strong>Focus:</strong> Sentence Building</p>
            <p><strong>Questions:</strong> {afrikaansQuestions.length || 12}</p>
            <p><strong>Time Limit:</strong> 120s</p>
          </div>
          <button onClick={startAfrikaansGame} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
            Start Game <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Xhosa Word Builder Card */}
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-[2.5rem] border-2 border-red-200 p-10 hover:shadow-2xl transition-all">
          <div className="mb-6 p-5 bg-red-600 rounded-2xl inline-block text-white">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-red-900 mb-3">Xhosa Word Builder</h3>
          <p className="text-red-700 text-sm mb-6">Master isiqumo seXhosa by constructing sentences and learning vocabulary at your level.</p>
          <div className="bg-white/60 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <p><strong>Grade Level:</strong> {userGrade}</p>
            <p><strong>Focus:</strong> Sentence Building</p>
            <p><strong>Questions:</strong> {xhosaQuestions.length || 12}</p>
            <p><strong>Time Limit:</strong> 120s</p>
          </div>
          <button onClick={startXhosaGame} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
            Start Game <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 p-8">
          <h4 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-3">
            <BarChart3 className="w-6 h-6" /> How Scoring Works
          </h4>
          <ul className="space-y-3 text-indigo-800 text-sm">
            <li className="flex gap-3"><span className="font-black">✓</span> <span>Correct answer = 100 base points + time bonus</span></li>
            <li className="flex gap-3"><span className="font-black">✓</span> <span>Faster answers = higher points</span></li>
            <li className="flex gap-3"><span className="font-black">✓</span> <span>Accuracy % displayed on completion</span></li>
            <li className="flex gap-3"><span className="font-black">✓</span> <span>Schools compete separately</span></li>
            <li className="flex gap-3"><span className="font-black">✓</span> <span>Your grade level auto-adjusts difficulty</span></li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-[2.5rem] border-2 border-purple-100 p-8">
          <h4 className="text-xl font-black text-purple-900 mb-4 flex items-center gap-3">
            <Trophy className="w-6 h-6" /> Competition & Leaderboards
          </h4>
          <ul className="space-y-3 text-purple-800 text-sm">
            <li className="flex gap-3"><span className="font-black">🏆</span> <span>Top 10 per grade, per school</span></li>
            <li className="flex gap-3"><span className="font-black">📊</span> <span>Track your best attempts</span></li>
            <li className="flex gap-3"><span className="font-black">🎯</span> <span>Grade-by-grade rankings</span></li>
            <li className="flex gap-3"><span className="font-black">📈</span> <span>Weekly challenges & achievements</span></li>
            <li className="flex gap-3"><span className="font-black">⭐</span> <span>Play unlimited times</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface GameLeaderboardViewProps {
  currentUser: User;
  onBack: () => void;
}

const GameLeaderboardView: React.FC<GameLeaderboardViewProps> = ({ currentUser, onBack }) => {
  const [leaderboards, setLeaderboards] = useState<Record<string, GameScore[]>>({});
  const [selectedGame, setSelectedGame] = useState<GameType>(GameType.MATH_BLITZ);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        const scores = await listDocs('gameScores');
        const filtered = (scores as GameScore[])
          .filter(s => s.schoolId === currentUser.schoolId && s.grade === currentUser.grade)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        
        setLeaderboards({
          [selectedGame]: filtered
        });
      } catch (error) {
        console.error('Failed to load leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboards();
  }, [selectedGame, currentUser]);

  const currentLeaderboard = leaderboards[selectedGame] || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-32 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900">Game Leaderboards</h2>
          <p className="text-slate-500 text-sm mt-2">Grade {currentUser.grade} • {currentUser.school || 'Your School'}</p>
        </div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] hover:scale-105 transition-all">
          <RotateCcw className="w-5 h-5 inline mr-2" /> Back
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {[GameType.MATH_BLITZ, GameType.ENGLISH_VOCAB, GameType.AFRIKAANS_BUILDER, GameType.XHOSA_BUILDER].map(game => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${
              selectedGame === game
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h3 className="text-2xl font-black">Top 10 Players - {selectedGame}</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading leaderboard...</div>
        ) : currentLeaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No scores yet. Be the first to play!</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentLeaderboard.map((entry, idx) => (
              <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-black text-lg text-slate-900">{entry.playerName}</p>
                    <p className="text-sm text-slate-500">{Math.round((entry.correctAnswers / entry.questionsAnswered) * 100)}% accuracy</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-600">{entry.score}</p>
                  <p className="text-xs text-slate-500 mt-1">{Math.floor(entry.timeSpent)}s</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningGamesModule;
