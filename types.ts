
export enum UserRole {
  PARENT = 'Parent',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
  PRINCIPAL = 'Principal'
}

export enum ResourceType {
  LINK = 'Video/Web Link',
  FILE = 'Document/Media'
}

export interface School {
  id: string;
  name: string;
  logoUrl: string;
  level?: 'Primary' | 'Secondary';
}

export interface User {
  id: string;
  name: string;
  surname?: string; 
  role: UserRole;
  relationship?: string; 
  grade: string; 
  classLetter?: string; 
  avatar: string;
  coverImage?: string; 
  email?: string;
  password?: string; 
  allowedGrades?: string[]; 
  selectedSubjects?: string[]; 
  school?: string;
  schoolId?: string;
  schoolLogo?: string;
  funFact?: string; 
  parentId?: string;
  idNumber?: string;
  allergens?: string;
  dob?: string;
  contactNumber?: string;
  siblingsInfo?: string;
  isPaid?: boolean;
  isGlobalResourceCreator?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  attachments?: Array<{
    url: string;
    fileName: string;
    type: string;
    fileType: 'mp4' | 'pdf' | 'docx' | 'image' | 'youtube' | 'other';
  }>;
  schoolId: string;
  authorName: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
}

export interface StudentCompletion {
  studentDone: boolean;
  parentSigned: boolean;
}

export type VisibilityType = 'school' | 'grade' | 'specific-grade' | 'all-schools';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  subject: string;
  grade: string;
  isCompleted: boolean;
  parentConfirmation: boolean;
  completions?: Record<string, StudentCompletion>;
  teacherKey?: string;
  comments: Comment[];
  attachments: { url: string; name: string; type: string }[];
  thumbnailUrl?: string;
  metadata?: string;
  schoolId: string;
  visibility: VisibilityType;
  visibleGrades?: string[];
  timestamp: number;
  // Completion tracking
  markedCompleteAt?: number; // Timestamp when marked complete
  markedCompleteBy?: string; // User ID who marked it complete
  markedCompleteName?: string; // Name of who marked it complete
  isMarkedComplete?: boolean; // True if manually marked, false if time-expired
  hideUntil?: number; // Timestamp to hide until (completed + 24hrs or due + 24hrs)
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: UserRole;
  content: string;
  timestamp: number;
  grade: string;
  schoolId: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage: string;
  lastTimestamp: number;
  schoolId: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  participants: string[];
}

export interface Resource {
  id: string;
  title: string;
  subject: string;
  type: ResourceType;
  description: string;
  url?: string;
  thumbnailUrl?: string; 
  metadata?: string;    
  fileName?: string;
  authorName: string;
  grade: string;
  forGrades?: string[];  // Multiple grades this resource targets
  schoolId: string;
  visibility: VisibilityType;
  visibleGrades?: string[];
  isPublic?: boolean;  // Teacher marked as published/public
  isGlobal?: boolean;  // Admin marked as global/network-wide
  contributedBy?: string;  // Which teacher contributed it
  timestamp: number;
}

export interface YearbookImage {
  url: string;
  caption: string;
}

export interface YearbookEntry {
  id: string;
  type: 'single' | 'album';
  title?: string;
  description?: string;
  images: YearbookImage[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: number;
  grade: string;
  likes: string[];
  schoolId: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  date: string;
  priority: 'Normal' | 'High';
  schoolId: string; 
}

export interface YearbookConfig {
  coverImage: string | null;
  principalMessage: string;
  principalPhoto: string | null;
  customPages?: string[]; 
  manualSections?: Record<string, string>; 
}

export type AlertType = 'Absent' | 'Sick' | 'Late';

export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string; 
  teacherName: string; 
  type: AlertType;
  date: string; 
  timestamp: number;
  grade: string;
  comments: Comment[];
  acknowledged: boolean; 
  resolved?: boolean; 
  schoolId: string;
}

export enum GameType {
  MATH_BLITZ = 'Math Blitz',
  ENGLISH_VOCAB = 'English Vocabulary',
  AFRIKAANS_BUILDER = 'Afrikaans Word Builder',
  XHOSA_BUILDER = 'Xhosa Word Builder'
}

export interface GameScore {
  id: string;
  gameType: GameType;
  subject: 'Mathematics' | 'English' | 'Afrikaans';
  schoolId: string;
  grade: string;
  playerId: string;
  playerName: string;
  score: number;
  accuracy: number; // percentage
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; // seconds
  difficulty: string;
  timestamp: number;
}

export interface GameLeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  accuracy: number;
  timestamp: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
  SHORT_ANSWER = 'short-answer',
  MATCHING = 'matching'
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[]; // String for short answer, array for matching
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  schoolId: string;
  createdBy: string; // Teacher/Admin name
  createdByRole: UserRole;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit: number; // minutes
  isPublished: boolean;
  isGlobal: boolean; // Admin quizzes only
  allowRetakes: boolean;
  passingScore: number; // percentage
  timestamp: number;
}

export interface StudentQuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  grade: string;
  answers: Record<string, string | string[]>; // question id -> answer
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // seconds
  attemptNumber: number;
  timestamp: number;
}
