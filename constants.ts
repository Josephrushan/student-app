
import { School, YearbookConfig } from "./types";

export const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
export const CLASSES = ["A", "B", "C", "D", "E"];

export const PRIMARY_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
export const SECONDARY_GRADES = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

// Added missing subject constants referenced in Homework, Tutoring, and Profile modules
export const PRIMARY_SUBJECTS = ["English", "Mathematics", "Natural Science", "Social Science", "Life Skills", "Arts & Culture", "Physical Education"];
export const HIGH_SCHOOL_SUBJECTS = ["English", "Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Business Studies", "History", "Geography", "Computer Applications Technology", "Life Orientation"];

export interface YearbookSection {
    id: string;
    title: string;
    description: string;
    group: string;
}

export const YEARBOOK_SECTIONS: YearbookSection[] = [
    { id: 'title', title: 'Title Page', description: 'Theme, school name, and year.', group: 'Introduction' },
    { id: 'toc', title: 'Table of Contents', description: 'Overview of the book.', group: 'Introduction' },
    { id: 'principal', title: 'Principal’s Message', description: 'Formal welcome and reflection.', group: 'Introduction' },
    
    // Dynamic Class Portraits
    { id: 'class_A', title: 'Class A Portraits', description: 'Student grid for section A.', group: 'The People' },
    { id: 'class_B', title: 'Class B Portraits', description: 'Student grid for section B.', group: 'The People' },
    { id: 'class_C', title: 'Class C Portraits', description: 'Student grid for section C.', group: 'The People' },
    { id: 'class_D', title: 'Class D Portraits', description: 'Student grid for section D.', group: 'The People' },
    { id: 'class_E', title: 'Class E Portraits', description: 'Student grid for section E.', group: 'The People' },
    { id: 'faculty', title: 'Faculty & Staff', description: 'Teachers and administration.', group: 'The People' },
    
    { id: 'classroom', title: 'The Classroom Experience', description: 'Labs, lectures, and group projects.', group: 'Academics' },
    { id: 'electives', title: 'Electives Showcase', description: 'Art, music, and tech classes.', group: 'Academics' },
    
    // Article-style Journal Highlights (Most Liked)
    { id: 'journal_1', title: 'Top Moment #1', description: 'Most liked journal memory.', group: 'Student Life' },
    { id: 'journal_2', title: 'Top Moment #2', description: 'Highly rated journal memory.', group: 'Student Life' },
    { id: 'journal_3', title: 'Top Moment #3', description: 'Highly rated journal memory.', group: 'Student Life' },
    { id: 'journal_4', title: 'Top Moment #4', description: 'Highly rated journal memory.', group: 'Student Life' },
    { id: 'journal_5', title: 'Top Moment #5', description: 'Highly rated journal memory.', group: 'Student Life' },
    
    { id: 'everyday', title: 'Everyday Moments', description: 'Lunchtime and hallway candids.', group: 'Student Life' },
    { id: 'fall_sports', title: 'Fall Sports', description: 'Football, soccer, cross country.', group: 'Athletics' },
    { id: 'winter_sports', title: 'Winter Sports', description: 'Basketball, swimming, etc.', group: 'Athletics' },
    { id: 'spring_sports', title: 'Spring Sports', description: 'Baseball, tennis, track.', group: 'Athletics' },
    { id: 'clubs', title: 'Organizations & Clubs', description: 'Robotics, debate, and groups.', group: 'Arts & Clubs' },
    { id: 'performing_arts', title: 'Performing Arts', description: 'Theater, choir, and band.', group: 'Arts & Clubs' },
    { id: 'year_review', title: 'Year in Review', description: 'Summary of world news and trends.', group: 'Community' },
    { id: 'tributes', title: 'Senior Tributes', description: 'Personal ads and dedications.', group: 'Community' },
    { id: 'student_index', title: 'Student Index', description: 'Master list of names.', group: 'Closing' },
    { id: 'closing_page', title: 'Closing Page', description: 'Final image and goodbye message.', group: 'Closing' },
    { id: 'autographs', title: 'Autograph Section', description: 'Space for friends to sign.', group: 'Closing' }
];

export const INITIAL_SCHOOLS: School[] = [];

export const INITIAL_YEARBOOK_CONFIG: YearbookConfig = {
  coverImage: null,
  principalMessage: "To our amazing students, keep shining bright! This year has been filled with incredible growth and memories.",
  principalPhoto: null,
  customPages: [],
  manualSections: {}
};
