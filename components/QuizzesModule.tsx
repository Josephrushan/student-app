import React, { useState, useEffect } from 'react';
import { User, Quiz, StudentQuizAttempt, QuestionType, UserRole } from '../types';
import { Plus, Edit2, Trash2, Play, ArrowLeft, CheckCircle2, X, Clock, Target, AlertCircle, Loader2 } from 'lucide-react';
import { saveDoc, listDocs, removeDoc } from '../services/firebaseService';
import { PRIMARY_SUBJECTS, HIGH_SCHOOL_SUBJECTS } from '../constants';

interface QuizzesModuleProps {
  currentUser: User;
}

const QuizzesModule: React.FC<QuizzesModuleProps> = ({ currentUser }) => {
  const [view, setView] = useState<'list' | 'create' | 'take' | 'results'>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<StudentQuizAttempt[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<StudentQuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for creating quiz
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState(currentUser.grade);
  const [newTimeLimit, setNewTimeLimit] = useState(30);
  const [newPassingScore, setNewPassingScore] = useState(70);
  const [newQuestions, setNewQuestions] = useState<Array<any>>([{ type: QuestionType.MULTIPLE_CHOICE, question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);

  const userGrade = currentUser.grade || '1';
  const availableSubjects = [1, 2, 3].includes(parseInt(userGrade)) ? PRIMARY_SUBJECTS : HIGH_SCHOOL_SUBJECTS;
  const isTeacher = currentUser.role === UserRole.TEACHER;
  const isAdmin = currentUser.role === UserRole.PRINCIPAL; // Principals can manage quizzes
  const isStudent = currentUser.role === UserRole.STUDENT;

  // Load quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const allQuizzes = await listDocs('quizzes');
        let filtered = allQuizzes as Quiz[];

        // Filter based on user role and school
        if (!isAdmin) {
          filtered = filtered.filter(q => 
            q.isGlobal || q.schoolId === currentUser.schoolId
          );
        }

        // Students only see published quizzes for their grade
        if (isStudent) {
          filtered = filtered.filter(q => q.isPublished && q.grade === userGrade);
        }

        setQuizzes(filtered.sort((a, b) => b.timestamp - a.timestamp));

        // Load student attempts if student
        if (isStudent) {
          const allAttempts = await listDocs('studentQuizAttempts');
          const studentAttempts = (allAttempts as StudentQuizAttempt[]).filter(a => a.studentId === currentUser.id);
          setAttempts(studentAttempts);
        }
      } catch (error) {
        console.error('Failed to load quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [currentUser.id, currentUser.schoolId, isStudent, isAdmin, userGrade]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSubject || newQuestions.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const totalPoints = newQuestions.reduce((sum, q) => sum + (q.points || 1), 0);

    const quiz: Quiz = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      subject: newSubject,
      grade: isAdmin ? 'all' : newGrade,
      schoolId: isAdmin ? 'global' : currentUser.schoolId || '',
      createdBy: currentUser.name,
      createdByRole: currentUser.role,
      questions: newQuestions.map(q => ({
        ...q,
        id: Math.random().toString()
      })),
      totalPoints,
      timeLimit: newTimeLimit,
      isPublished: isAdmin ? true : false,
      isGlobal: isAdmin,
      allowRetakes: true,
      passingScore: newPassingScore,
      timestamp: Date.now(),
    };

    try {
      await saveDoc('quizzes', quiz.id, quiz);
      alert('Quiz created successfully!');
      setNewTitle('');
      setNewDescription('');
      setNewSubject('');
      setNewQuestions([{ type: QuestionType.MULTIPLE_CHOICE, question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);
      setView('list');
      setQuizzes([quiz, ...quizzes]);
    } catch (error) {
      alert('Failed to create quiz: ' + error);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    const attempt: StudentQuizAttempt = {
      id: Date.now().toString(),
      quizId: quiz.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      schoolId: currentUser.schoolId || '',
      grade: userGrade,
      answers: {},
      score: 0,
      percentage: 0,
      passed: false,
      timeSpent: 0,
      attemptNumber: attempts.filter(a => a.quizId === quiz.id).length + 1,
      timestamp: Date.now(),
    };
    setCurrentAttempt(attempt);
    setView('take');
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttempt || !selectedQuiz) return;

    // Calculate score
    let score = 0;
    selectedQuiz.questions.forEach(q => {
      const answer = currentAttempt.answers[q.id];
      if (answer && answer === q.correctAnswer) {
        score += q.points;
      }
    });

    const percentage = Math.round((score / selectedQuiz.totalPoints) * 100);
    const passed = percentage >= selectedQuiz.passingScore;

    const finalAttempt: StudentQuizAttempt = {
      ...currentAttempt,
      score,
      percentage,
      passed,
      timestamp: Date.now(),
    };

    try {
      await saveDoc('studentQuizAttempts', finalAttempt.id, finalAttempt);
      setCurrentAttempt(finalAttempt);
      setAttempts([...attempts, finalAttempt]);
      setView('results');
    } catch (error) {
      alert('Failed to submit quiz: ' + error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await removeDoc('quizzes', quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (error) {
      alert('Failed to delete quiz');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }

  // Quiz results view
  if (view === 'results' && currentAttempt && selectedQuiz) {
    return (
      <div className="max-w-2xl mx-auto p-8 animate-fade-in">
        <button onClick={() => { setView('list'); setCurrentAttempt(null); setSelectedQuiz(null); }} className="mb-8 px-6 py-3 bg-slate-100 rounded-lg font-black uppercase text-[10px] hover:scale-105 transition-all flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>

        <div className={`rounded-[2.5rem] p-12 text-center text-white shadow-2xl mb-8 ${currentAttempt.passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
          <div className="flex justify-center mb-6">
            {currentAttempt.passed ? 
              <CheckCircle2 className="w-20 h-20" /> : 
              <AlertCircle className="w-20 h-20" />
            }
          </div>
          <h2 className="text-4xl font-black mb-4">{currentAttempt.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
          <p className="text-xl mb-8 opacity-90">{selectedQuiz.title}</p>
          
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="bg-white/20 rounded-2xl p-6">
              <p className="text-sm opacity-75 mb-2">Score</p>
              <p className="text-4xl font-black">{currentAttempt.score}/{selectedQuiz.totalPoints}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-6">
              <p className="text-sm opacity-75 mb-2">Percentage</p>
              <p className="text-4xl font-black">{currentAttempt.percentage}%</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-6">
              <p className="text-sm opacity-75 mb-2">Required</p>
              <p className="text-4xl font-black">{selectedQuiz.passingScore}%</p>
            </div>
          </div>

          <button onClick={() => { setView('list'); setCurrentAttempt(null); setSelectedQuiz(null); }} className="px-12 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-widest">
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Quiz taking view
  if (view === 'take' && currentAttempt && selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[Object.keys(currentAttempt.answers).length];
    const questionNumber = Object.keys(currentAttempt.answers).length + 1;
    const isLastQuestion = questionNumber === selectedQuiz.questions.length;

    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black text-slate-900">{selectedQuiz.title}</h2>
            <span className="text-sm font-bold text-slate-500">Question {questionNumber} of {selectedQuiz.questions.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width: `${(questionNumber / selectedQuiz.questions.length) * 100}%`}}></div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-10 mb-8 shadow-lg">
          <h3 className="text-xl font-black text-slate-900 mb-8">{currentQuestion?.question}</h3>

          {currentQuestion?.type === QuestionType.MULTIPLE_CHOICE && (
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion?.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const newAnswers = { ...currentAttempt.answers, [currentQuestion.id]: option };
                    setCurrentAttempt({ ...currentAttempt, answers: newAnswers });
                  }}
                  className={`p-4 rounded-xl border-2 font-bold text-left transition-all ${
                    currentAttempt.answers[currentQuestion.id] === option
                      ? 'bg-blue-100 border-blue-600 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === QuestionType.TRUE_FALSE && (
            <div className="grid grid-cols-2 gap-4">
              {['True', 'False'].map(option => (
                <button
                  key={option}
                  onClick={() => {
                    const newAnswers = { ...currentAttempt.answers, [currentQuestion.id]: option };
                    setCurrentAttempt({ ...currentAttempt, answers: newAnswers });
                  }}
                  className={`p-6 rounded-xl border-2 font-bold text-xl transition-all ${
                    currentAttempt.answers[currentQuestion.id] === option
                      ? 'bg-blue-100 border-blue-600 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === QuestionType.SHORT_ANSWER && (
            <input
              type="text"
              value={currentAttempt.answers[currentQuestion.id] || ''}
              onChange={(e) => {
                const newAnswers = { ...currentAttempt.answers, [currentQuestion.id]: e.target.value };
                setCurrentAttempt({ ...currentAttempt, answers: newAnswers });
              }}
              placeholder="Type your answer..."
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl font-medium focus:border-blue-600 outline-none"
            />
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              if (questionNumber > 1) {
                const answers = { ...currentAttempt.answers };
                delete answers[selectedQuiz.questions[questionNumber - 2].id];
                setCurrentAttempt({ ...currentAttempt, answers });
              }
            }}
            disabled={questionNumber === 1}
            className="px-8 py-4 bg-slate-100 text-slate-900 rounded-xl font-black uppercase text-[10px] disabled:opacity-50"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => {
                // Auto-advance to next question
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    );
  }

  // Create quiz view
  if (view === 'create' && (isTeacher || isAdmin)) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <button onClick={() => setView('list')} className="mb-8 px-6 py-3 bg-slate-100 rounded-lg font-black uppercase text-[10px] hover:scale-105 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-10 shadow-lg">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Create New Quiz</h2>

          <form onSubmit={handleCreateQuiz} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Quiz Title *</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full mt-2 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium focus:border-blue-600 outline-none" placeholder="e.g. Chapter 5 Math Test" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Subject *</label>
                <select required value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full mt-2 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium focus:border-blue-600 outline-none">
                  <option value="">Select subject...</option>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Description</label>
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full mt-2 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium focus:border-blue-600 outline-none resize-none" placeholder="Optional: Add context for students..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {!isAdmin && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Grade</label>
                  <input type="text" disabled value={newGrade} className="w-full mt-2 px-6 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-medium text-slate-500" />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Time Limit (minutes)</label>
                <input type="number" min="1" max="180" value={newTimeLimit} onChange={(e) => setNewTimeLimit(parseInt(e.target.value))} className="w-full mt-2 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium focus:border-blue-600 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Passing Score (%)</label>
                <input type="number" min="0" max="100" value={newPassingScore} onChange={(e) => setNewPassingScore(parseInt(e.target.value))} className="w-full mt-2 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium focus:border-blue-600 outline-none" />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Questions ({newQuestions.length})</h3>
              <button
                type="button"
                onClick={() => setNewQuestions([...newQuestions, { type: QuestionType.MULTIPLE_CHOICE, question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }])}
                className="mb-6 px-6 py-3 bg-blue-100 text-blue-600 rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
              <p className="text-sm text-slate-600 mb-4">Note: Question builder UI simplified. Full implementation adds drag-to-reorder, image uploads, and equation support.</p>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-slate-200">
              <button type="button" onClick={() => setView('list')} className="px-10 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase text-[10px] hover:scale-105 transition-all">
                Cancel
              </button>
              <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:scale-105 transition-all">
                Create Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-32">
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quizzes</h2>
      </div>

      {(isTeacher || isAdmin) && (
        <button onClick={() => setView('create')} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-black text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6 mx-4">
          <Plus className="w-5 h-5" /> Create New Quiz
        </button>
      )}

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">Assess Student Learning</p>

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold">No quizzes available yet</p>
          </div>
        ) : (
          quizzes.map(quiz => {
            const userAttempts = attempts.filter(a => a.quizId === quiz.id);
            const bestAttempt = userAttempts.length > 0 ? userAttempts.sort((a, b) => b.score - a.score)[0] : null;

            return (
              <div key={quiz.id} className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-slate-900">{quiz.title}</h3>
                      {quiz.isGlobal && <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg">Global</span>}
                      {!quiz.isPublished && isTeacher && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg">Draft</span>}
                    </div>
                    <p className="text-slate-600 text-sm mb-4">{quiz.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 uppercase">
                      <span>Grade {quiz.grade}</span>
                      <span>•</span>
                      <span>{quiz.subject}</span>
                      <span>•</span>
                      <span>{quiz.questions.length} Questions</span>
                      <span>•</span>
                      <span>{quiz.timeLimit} min</span>
                      <span>•</span>
                      <span>Pass: {quiz.passingScore}%</span>
                    </div>
                    {bestAttempt && isStudent && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                        <p className="text-[10px] font-black text-blue-700">Best Score: {bestAttempt.score}/{quiz.totalPoints} ({bestAttempt.percentage}%) {bestAttempt.passed ? '✅ Passed' : '❌ Failed'}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {isStudent && quiz.isPublished && (
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" /> Take Quiz
                      </button>
                    )}
                    {(isTeacher || isAdmin) && (
                      <>
                        <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] hover:scale-105 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-black text-[10px] hover:scale-105 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuizzesModule;
