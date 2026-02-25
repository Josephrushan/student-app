/**
 * EDUCATER INSTITUTE SETUP HELPER
 * 
 * This file contains helper functions to initialize the Educater Institute
 * school and both principal accounts in your Firebase project.
 * 
 * Usage:
 * 1. Copy these functions to your browser console or a backend service
 * 2. Run: initializeEducaterInstitute()
 * 3. Verify that both accounts exist in Firebase Console
 */

import { db, saveDoc } from './firebaseService';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { UserRole, School, User } from '../types';

/**
 * Initialize the Educater Institute school and both principal accounts
 */
export const initializeEducaterInstitute = async () => {
  try {
    console.log('🚀 Starting Educater Institute initialization...');
    
    // Step 1: Create the school
    await createEducaterInstitute();
    console.log('✅ Educater Institute school created/verified');
    
    // Step 2: Create principals
    // Note: These will auto-create accounts when they first log in via the LoginScreen
    console.log('✅ Principal accounts are created automatically on first login');
    console.log('   - Sign in with: info@visualmotion.co.za / Imsocool123');
    console.log('   - Sign in with: test@educater.co.za / Educater123');
    
    console.log('✨ Educater Institute initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    return false;
  }
};

/**
 * Create or verify the Educater Institute school
 */
const createEducaterInstitute = async () => {
  const schoolId = 'educater-institute';
  const schoolData: School = {
    id: schoolId,
    name: 'Educater Institute',
    logoUrl: 'https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256',
    level: 'Secondary'
  };
  
  // Check if it exists
  try {
    const existing = await getDocs(
      query(collection(db, 'schools'), where('id', '==', schoolId))
    );
    
    if (existing.docs.length > 0) {
      console.log('ℹ️  Educater Institute already exists');
      return;
    }
  } catch (err) {
    console.log('Creating school...');
  }
  
  // Create the school
  await saveDoc('schools', schoolId, schoolData);
  console.log('📚 School document created');
};

/**
 * Create a principal account manually (if auto-creation fails)
 * This function is for administrative use only
 */
export const createPrincipalManually = async (
  email: string,
  name: string,
  surname: string,
  uid: string
) => {
  const userData: User = {
    id: uid,
    name: name,
    surname: surname,
    email: email,
    role: UserRole.PRINCIPAL,
    school: 'Educater Institute',
    schoolId: 'educater-institute',
    schoolLogo: 'https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256',
    grade: 'All',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name + ' ' + surname)}&background=072432&color=fff`,
    isPaid: true,
    allowedGrades: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    isGlobalResourceCreator: true
  };
  
  await saveDoc('users', uid, userData);
  console.log(`✅ Principal account created: ${email}`);
};

/**
 * MANUAL FIREBASE CONSOLE SETUP (Alternative)
 * 
 * If you prefer to set up manually via Firebase Console:
 * 
 * 1. Go to: https://console.firebase.google.com/
 * 2. Select your project
 * 3. Go to Firestore Database
 * 4. Create a new document in 'schools' collection
 *    - Document ID: educater-institute
 *    - Fields:
 *      - id: educater-institute
 *      - name: Educater Institute
 *      - logoUrl: https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256
 *      - level: Secondary
 * 
 * 5. The user documents will be created automatically when they first log in
 * 
 * EXPECTED BEHAVIOR AFTER SETUP:
 * ✓ Sign in with info@visualmotion.co.za / Imsocool123
 * ✓ See "Educater Institute" as your school
 * ✓ Have full principal/admin features
 * ✓ All materials you create are automatically global
 * 
 * ✓ Sign in with test@educater.co.za / Educater123
 * ✓ Same experience as above
 */

export default initializeEducaterInstitute;
