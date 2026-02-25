import React, { useState, useEffect } from 'react';
import { UserRole, User, School } from '../types';
import { 
  ArrowRight, 
  Lock, 
  Building2, 
  ShieldCheck, 
  X, 
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Shield,
  Smartphone,
  Check,
  Zap,
  AlertCircle,
  Mail,
  GraduationCap,
  ShieldAlert,
  ChevronDown,
  BookOpen,
  LayoutGrid,
  Heart,
  Info,
  User as UserIcon,
  Crown,
  CreditCard as PaymentIcon,
  Key
} from 'lucide-react';
import { PRIMARY_GRADES, SECONDARY_GRADES, CLASSES } from '../constants';
import { db, saveDoc, setupListener, auth, listDocs, patchDoc, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '../services/firebaseService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Logo from './Logo';

// Declare Paystack global for TypeScript
declare const PaystackPop: any;

interface LoginScreenProps {
  onLogin: (user: User) => void;
  allUsers?: User[]; 
}

/**
 * Modernized Paywall Screen using Paystack v2
 * Refined to prevent cutoff on mobile devices
 */
const PaywallView = ({ user, onCancel, onComplete }: { user: User, onCancel: () => void, onComplete: () => void }) => {
    const [isInitializing, setIsInitializing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const benefits = [
        "Full access to the Parent Portal",
        "Secure student-link account creation",
        "Real-time academic feed tracking",
        "Direct chat with school educators",
        "Instant health & absence notifications",
        "High-priority institutional bulletins"
    ];

    const payWithPaystack = () => {
        if (typeof PaystackPop === 'undefined') {
            setErrorMessage("Payment system is still loading. Please refresh and try again.");
            return;
        }

        const paystackKey = process.env.PAYSTACK_PUBLIC_KEY || 'pk_live_3588ef6c18030263971b1f6c63b747d8cd3239d2';
        const planCode = process.env.PAYSTACK_PLAN_CODE || 'PLN_2mpqf2exmwpzbcf';

        if (!paystackKey) {
            setErrorMessage("Payment configuration error. Please contact support.");
            return;
        }

        setIsInitializing(true);
        try {
            const paystack = new PaystackPop();
            paystack.newTransaction({
                key: paystackKey,
                email: user.email,
                amount: 50 * 100, // R50.00 in cents/kobo
                currency: 'ZAR',
                plan: planCode, // Monthly subscription plan
                metadata: {
                    userId: user.id,
                    custom_fields: [
                        { display_name: "School", variable_name: "school_name", value: user.school },
                        { display_name: "User ID", variable_name: "user_id", value: user.id }
                    ]
                },
                onSuccess: (transaction: any) => {
                    setIsInitializing(false);
                    onComplete();
                },
                onCancel: () => {
                    setIsInitializing(false);
                },
                onError: (error: any) => {
                    setIsInitializing(false);
                    setErrorMessage("Payment processing error. Please try again or contact support.");
                }
            });
        } catch (err) {
            setIsInitializing(false);
            console.error("Paystack error:", err);
            setErrorMessage("Payment system initialization failed. Please ensure you are connected to the internet and refresh the page.");
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl overflow-y-auto hide-scrollbar p-4 sm:p-6 flex justify-center items-start pt-8 pb-12">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up">
                {/* Benefits Side */}
                <div className="bg-[#002135] p-8 sm:p-12 md:p-16 text-white md:w-5/12 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="space-y-4 sm:space-y-6">
                            {benefits.map((b, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1 bg-brand-teal rounded-full p-1 shrink-0 shadow-lg shadow-brand-teal/10">
                                        <Check className="w-3 h-3 text-[#002135] stroke-[4]" />
                                    </div>
                                    <p className="text-sm text-slate-100 font-bold leading-snug">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                        <p className="text-[10px] text-brand-teal font-black uppercase tracking-[0.2em] mb-2">Institutional Plan</p>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            A single subscription secures full portal access and a private, linked account for your child.
                        </p>
                    </div>
                </div>

                {/* Checkout Side */}
                <div className="flex-1 flex flex-col bg-white text-left p-8 sm:p-12 md:p-16">
                    <div className="flex justify-between items-center mb-10 sm:mb-12">
                        <Logo size="sm" />
                        <button onClick={onCancel} className="p-3 bg-slate-50 hover:bg-red-50 rounded-2xl transition-all text-slate-400 hover:text-red-500 shadow-sm">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {errorMessage && <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 animate-fade-in"><AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-700 font-bold leading-tight">{errorMessage}</p></div>}

                    <div className="space-y-8 sm:space-y-10">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Membership Fee</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter">R50.00</h3>
                                <span className="text-slate-400 font-bold text-lg">/month</span>
                            </div>
                            <p className="text-[#002135] font-black text-[10px] mt-4 flex items-center gap-2 uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4 text-brand-teal" /> Safe & Secure Payment via Paystack
                            </p>
                        </div>

                        <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-navy shadow-sm">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Linked Account</p>
                                    <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={payWithPaystack} 
                                disabled={isInitializing} 
                                className="w-full py-6 sm:py-7 bg-[#002135] text-white text-xs font-black uppercase tracking-[0.3em] rounded-[2rem] hover:brightness-110 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] disabled:opacity-50"
                            >
                                {isInitializing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Opening Gateway...</span>
                                    </div>
                                ) : (
                                    <>
                                        <PaymentIcon className="w-5 h-5 text-brand-teal" />
                                        Subscribe Now
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-slate-400 text-center font-bold px-4 leading-relaxed">
                                Subscription processed through Paystack's PCI-DSS Level 1 certified infrastructure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, allUsers = [] }) => {
  const [view, setView] = useState<'landing' | 'signup_choice' | 'form' | 'paywall' | 'forgot_password' | 'role_staff_choice'>('landing');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSchools, setIsFetchingSchools] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSignInOption, setShowSignInOption] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PARENT);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [selectedRelationship, setSelectedRelationship] = useState('Mother');
  const [customRelationship, setCustomRelationship] = useState('');
  const [teacherGrades, setTeacherGrades] = useState<string[]>([]);
  const [passkey, setPasskey] = useState('');
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
      const initSchools = async () => {
          setIsFetchingSchools(true);
          const data = await listDocs('schools');
          if (data && data.length > 0) {
              setSchools(data as School[]);
          }
          setIsFetchingSchools(false);
      };
      initSchools();
  }, []);

  useEffect(() => {
    if (mode !== 'signup' || (view !== 'form' && view !== 'role_staff_choice')) return;
    if (schools.length > 0) return; 
    
    const unsubscribe = setupListener('schools', (data) => {
        if (data && data.length > 0) {
            setSchools(data as School[]);
        }
    });
    return () => unsubscribe();
  }, [mode, view, schools.length]);

  const currentSchool = schools.find(s => s.id === selectedSchoolId);
  const filteredGrades = currentSchool?.level === 'Secondary' ? SECONDARY_GRADES : PRIMARY_GRADES;

  useEffect(() => {
    if (schools.length > 0 && !selectedSchoolId) {
        setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  useEffect(() => {
    if (filteredGrades.length > 0 && !filteredGrades.includes(selectedGrade)) {
        setSelectedGrade(filteredGrades[0]);
    }
  }, [selectedSchoolId, filteredGrades, selectedGrade]);

  const handleBack = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setShowSignInOption(false);
    if (view === 'signup_choice') setView('landing');
    else if (view === 'role_staff_choice') setView('signup_choice');
    else if (view === 'forgot_password') setView('form');
    else if (view === 'form') {
        if (mode === 'signin') setView('landing');
        else if (selectedRole === UserRole.PARENT) setView('signup_choice');
        else setView('role_staff_choice');
    }
  };

  const handleRoleSelection = (role: 'parent' | 'staff') => {
      if (role === 'parent') {
          setSelectedRole(UserRole.PARENT);
          setView('form');
      } else {
          setView('role_staff_choice');
      }
  };

  const handleStaffRoleSelection = (role: UserRole.TEACHER | UserRole.PRINCIPAL) => {
      setSelectedRole(role);
      setView('form');
  };

  const isPrincipalAvailableForSchool = (schoolId: string) => {
      return !allUsers.some(u => u.schoolId === schoolId && u.role === UserRole.PRINCIPAL);
  };

  const toggleTeacherGrade = (grade: string) => {
    setTeacherGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) { 
        setErrorMessage("Please enter your email address."); 
        return; 
    }
    
    setIsLoading(true); 
    setErrorMessage(''); 
    setSuccessMessage('');
    
    try {
        await sendPasswordResetEmail(auth, normalizedEmail);
        setSuccessMessage("Success! Check your email inbox for a reset link.");
        setEmail('');
    } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
            setErrorMessage("Account not found with this email.");
        } else {
            setErrorMessage("Failed to send reset link. Try again later.");
        }
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleFinalizePayment = async () => {
    if (!activeUser) return;
    setIsLoading(true);
    try {
        await patchDoc('users', activeUser.id, { isPaid: true });
        const finalUser = { ...activeUser, isPaid: true };
        onLogin(finalUser);
    } catch (err) {
        setErrorMessage("Payment verification failed. Please contact support.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true); 
    setErrorMessage('');
    const normalizedEmail = email.toLowerCase().trim();
    
    // Educater Institute Super Admin Bypass
    // Both info@visualmotion.co.za and test@educater.co.za are principals of Educater Institute
    const eduResources = [
      { email: 'info@visualmotion.co.za', password: 'Imsocool123', name: 'System', surname: 'Admin' },
      { email: 'test@educater.co.za', password: 'Educater123', name: 'Test', surname: 'Principal' }
    ];
    
    const eduResource = eduResources.find(r => r.email === normalizedEmail && r.password === password);
    
    if (eduResource) {
        try {
            // First attempt normal sign in
            await signInWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (authErr: any) {
            // If user doesn't exist, create account for Educater Institute
            if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, normalizedEmail, password);
                } catch (createErr) {
                    console.warn("Educater Institute account provisioning failed.", createErr);
                }
            } else {
                console.warn("Educater Institute Auth Error:", authErr);
            }
        }
        
        // Return user object as Principal of Educater Institute
        const educaterUser: User = {
            id: auth.currentUser?.uid || `educater_${Date.now()}`,
            name: eduResource.name,
            surname: eduResource.surname,
            email: normalizedEmail,
            role: UserRole.PRINCIPAL, 
            school: 'Educater Institute',
            schoolId: 'educater-institute',
            schoolLogo: 'https://ui-avatars.com/api/?name=Educater+Institute&background=072432&color=fff&size=256',
            grade: 'All',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(eduResource.name + ' ' + eduResource.surname)}&background=072432&color=fff`,
            isPaid: true,
            allowedGrades: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
            isGlobalResourceCreator: true
        };
        onLogin(educaterUser);
        setIsLoading(false);
        return;
    }

    try {
      if (mode === 'signup') {
        // Passkey validation for educators
        if ((selectedRole === UserRole.TEACHER || selectedRole === UserRole.PRINCIPAL) && passkey !== 'Educater2026') {
            setErrorMessage("Invalid educator passkey. Please contact your school administrator.");
            setIsLoading(false);
            return;
        }

        if (selectedRole === UserRole.PRINCIPAL && !isPrincipalAvailableForSchool(selectedSchoolId)) {
            setErrorMessage("A principal has already registered for this school."); 
            setIsLoading(false); 
            return;
        }

        if (selectedRole === UserRole.TEACHER && teacherGrades.length === 0) {
            setErrorMessage("Please select at least one grade level."); 
            setIsLoading(false); 
            return;
        }

        let fbUser;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            fbUser = userCredential.user;
        } catch (authErr: any) {
            if (authErr.code === 'auth/email-already-in-use') {
                // Check if this account exists but is unpaid - allow retry payment
                if (selectedRole === UserRole.PARENT) {
                    try {
                        const emailSnap = await getDocs(query(collection(db, 'users'), where('email', '==', normalizedEmail)));
                        if (emailSnap.docs.length > 0) {
                            const existingUser = emailSnap.docs[0].data() as User;
                            if (existingUser.role === UserRole.PARENT && !existingUser.isPaid) {
                                setErrorMessage("This email is already registered but payment wasn't completed. Please sign in to retry payment.");
                                setShowSignInOption(true);
                                setIsLoading(false);
                                return;
                            }
                        }
                    } catch (err) {
                        // If check fails, show generic error
                        console.error("Error checking existing user:", err);
                    }
                }
                setErrorMessage("This email address is already registered. Please sign in instead.");
                setShowSignInOption(true);
            } else if (authErr.code === 'auth/weak-password') {
                setErrorMessage("Password should be at least 6 characters.");
                setShowSignInOption(false);
            } else {
                setErrorMessage("Account creation failed. Please check your connection.");
                setShowSignInOption(false);
            }
            setIsLoading(false);
            return;
        }

        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + (surname || ''))}&background=00ff8e&color=fff&size=256`;
        
        const finalRelationship = selectedRole === UserRole.PARENT 
            ? (selectedRelationship === 'Other' ? customRelationship : selectedRelationship)
            : undefined;

        const signupGrade = selectedRole === UserRole.PRINCIPAL ? filteredGrades[0] : (selectedRole === UserRole.TEACHER ? teacherGrades[0] : selectedGrade);
        const signupAllowedGrades = selectedRole === UserRole.PRINCIPAL ? filteredGrades : (selectedRole === UserRole.TEACHER ? teacherGrades : undefined);

        const newUser: User = { 
            id: fbUser.uid,
            name: firstName, 
            surname, 
            email: normalizedEmail, 
            password, 
            role: selectedRole, 
            relationship: finalRelationship, 
            grade: signupGrade,
            classLetter: selectedRole === UserRole.PARENT ? selectedClass : undefined,
            school: currentSchool?.name || '', 
            schoolId: currentSchool?.id || '', 
            schoolLogo: currentSchool?.logoUrl || '', 
            avatar: avatarUrl, 
            isPaid: selectedRole !== UserRole.PARENT, 
            allowedGrades: signupAllowedGrades
        };

        await saveDoc('users', fbUser.uid, newUser);

        // Set custom claims on the auth token for storage rules
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            const token = await fbUser.getIdToken();
            const response = await fetch(`${backendUrl}/api/auth/set-custom-claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: fbUser.uid,
                    role: selectedRole,
                    schoolId: currentSchool?.id || ''
                })
            });
            if (!response.ok) {
                console.warn('⚠️ Failed to set custom claims:', await response.text());
            } else {
                console.log('✅ Custom claims set successfully');
            }
        } catch (claimsError) {
            console.warn('⚠️ Error setting custom claims:', claimsError);
            // Don't block signup if claims fail - user can still sign in
        }
        setActiveUser(newUser);

        if (selectedRole === UserRole.PARENT) { 
            setView('paywall'); 
            setIsLoading(false); 
        } else {
            onLogin(newUser);
        }
      } else {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            const fbUser = userCredential.user;
            
            const usersRef = collection(db, "users");
            const emailQuery = query(usersRef, where("email", "==", normalizedEmail));
            const emailSnap = await getDocs(emailQuery);
            
            if (emailSnap.empty) { 
                setErrorMessage("Profile data not found."); 
                setIsLoading(false); 
                return; 
            }
            
            const userData = emailSnap.docs[0].data() as User;
            setActiveUser(userData);

            if (userData.role === UserRole.PARENT && !userData.isPaid) {
                setView('paywall');
                setIsLoading(false);
            } else {
                onLogin(userData);
            }
        } catch (authErr: any) {
            if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found') {
                setErrorMessage("Incorrect email or password.");
            } else {
                setErrorMessage("Sign in failed. Check your connection.");
            }
            setIsLoading(false);
        }
      }
    } catch (err: any) { 
        setErrorMessage("Something went wrong. Please try again."); 
        setIsLoading(false); 
    }
  };

  const isPrincipalRegistered = isPrincipalAvailableForSchool(selectedSchoolId) === false;

  return (
    <div className="min-h-screen bg-brand-slate flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
      
      {view === 'paywall' && activeUser && (
        <PaywallView 
            user={activeUser} 
            onCancel={() => setView('form')} 
            onComplete={handleFinalizePayment} 
        />
      )}
      
      <div className="w-full max-w-md space-y-8 animate-fade-in relative flex flex-col max-h-screen overflow-y-auto hide-scrollbar py-12">
        <div className="flex flex-col items-center">
          <Logo size="lg" className="mb-12" />
          
          {view === 'landing' && (
              <div className="w-full space-y-6 animate-slide-up">
                  <div className="text-center space-y-2 mb-10"><h2 className="text-3xl text-[#002135] tracking-tight font-black">Welcome back</h2><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Your digital campus awaits</p></div>
                  <button onClick={() => { setMode('signin'); setView('form'); }} className="w-full py-6 bg-[#002135] text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3">Sign in <ArrowRight className="w-4 h-4" /></button>
                  <button onClick={() => { setMode('signup'); setMode('signup'); setView('signup_choice'); }} className="w-full py-6 bg-white border-2 border-slate-100 text-[#002135] rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-sm hover:border-brand-teal transition-all active:scale-95">Create account</button>
              </div>
          )}

          {view === 'signup_choice' && (
              <div className="w-full space-y-6 animate-slide-up text-left">
                  <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 hover:text-[#002135] transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <h3 className="text-2xl text-[#002135] mb-8 font-black">What is your role?</h3>
                  <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => handleRoleSelection('parent')} className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-brand-teal hover:shadow-xl transition-all group text-left">
                          <div className="p-4 bg-brand-navy/5 rounded-2xl group-hover:bg-[#002135] transition-colors"><UserIcon className="w-8 h-8 text-[#002135] group-hover:text-white" /></div>
                          <div><p className="text-[#002135] text-lg font-black leading-tight">Parent / guardian</p><p className="text-xs text-slate-500 font-bold mt-1">Connect with your child</p></div>
                      </button>
                      <button onClick={() => handleRoleSelection('staff')} className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-brand-teal hover:shadow-xl transition-all group text-left">
                          <div className="p-4 bg-brand-navy/5 rounded-2xl group-hover:bg-[#002135] transition-colors"><Building2 className="w-8 h-8 text-[#002135] group-hover:text-white" /></div>
                          <div><p className="text-[#002135] text-lg font-black leading-tight">School employee</p><p className="text-xs text-slate-500 font-bold mt-1">Educators and admin</p></div>
                      </button>
                  </div>
              </div>
          )}

          {view === 'role_staff_choice' && (
              <div className="w-full space-y-6 animate-slide-up text-left">
                  <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 hover:text-[#002135] transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <h3 className="text-2xl text-[#002135] mb-4 font-black">Select staff role</h3>
                  
                  <div className="space-y-1 mb-8">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm your school first</label>
                    <div className="relative">
                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        {isFetchingSchools ? (
                            <div className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-400 flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin" /> Fetching school list...
                            </div>
                        ) : schools.length === 0 ? (
                            <div className="w-full pl-14 pr-6 py-4 bg-white border-2 border-red-50 rounded-[1.5rem] text-sm font-bold text-red-500 flex items-center gap-3">
                                <AlertCircle className="w-4 h-4" /> No schools found. Contact support.
                            </div>
                        ) : (
                            <select 
                                value={selectedSchoolId} 
                                onChange={e => setSelectedSchoolId(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 focus:border-brand-teal rounded-[1.5rem] outline-none appearance-none text-sm font-bold text-[#002135]"
                            >
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        )}
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => handleStaffRoleSelection(UserRole.TEACHER)} className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-brand-teal hover:shadow-xl transition-all group text-left">
                          <div className="p-4 bg-brand-navy/5 rounded-2xl group-hover:bg-[#002135] transition-colors"><GraduationCap className="w-8 h-8 text-[#002135] group-hover:text-white" /></div>
                          <div><p className="text-[#002135] text-lg font-black leading-tight">Educator</p><p className="text-xs text-slate-500 font-bold mt-1">Teacher or curriculum staff</p></div>
                      </button>
                      <div className="relative">
                        <button 
                            disabled={isPrincipalRegistered || schools.length === 0} 
                            onClick={() => handleStaffRoleSelection(UserRole.PRINCIPAL)} 
                            className={`w-full flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 transition-all group text-left ${isPrincipalRegistered || schools.length === 0 ? 'opacity-50 grayscale border-slate-100 cursor-not-allowed' : 'border-slate-100 hover:border-brand-teal hover:shadow-xl'}`}
                        >
                            <div className={`p-4 rounded-2xl transition-colors ${isPrincipalRegistered || schools.length === 0 ? 'bg-slate-100' : 'bg-brand-navy/5 group-hover:bg-[#002135]'}`}><ShieldCheck className={`w-8 h-8 ${isPrincipalRegistered || schools.length === 0 ? 'text-slate-400' : 'text-[#002135] group-hover:text-white'}`} /></div>
                            <div><p className="text-[#002135] text-lg font-black leading-tight">Principal</p><p className="text-xs text-slate-500 font-bold mt-1">School leadership and admin</p></div>
                        </button>
                        {isPrincipalRegistered && <div className="absolute top-2 right-6 px-3 py-1 bg-red-50 border border-red-100 rounded-full flex items-center gap-1.5 shadow-sm"><ShieldAlert className="w-3 h-3 text-red-500" /><span className="text-[9px] text-red-600 font-black uppercase tracking-widest">Already registered</span></div>}
                      </div>
                  </div>
              </div>
          )}

          {view === 'forgot_password' && (
            <div className="w-full animate-slide-up text-left">
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 hover:text-[#002135] transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
                    <div className="bg-brand-teal/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-brand-teal/10">
                        <Lock className="w-8 h-8 text-brand-teal" />
                    </div>
                    <h3 className="text-3xl text-[#002135] mb-4 font-black tracking-tight">Forgot password?</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">Enter your email and we'll send a link to reset your password via Firebase secure authentication.</p>
                    
                    {errorMessage && <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 animate-fade-in"><AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-700 font-bold leading-tight">{errorMessage}</p></div>}
                    
                    {successMessage ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 border border-green-100"><CheckCircle2 className="w-8 h-8" /></div>
                            <p className="text-slate-700 font-black text-lg">{successMessage}</p>
                            <button onClick={() => setView('form')} className="w-full py-4 text-[#002135] font-black uppercase tracking-[0.2em] text-[10px]">Back to sign in</button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-1 text-left"><label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Email address</label><div className="relative"><Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-brand-teal rounded-[1.5rem] outline-none text-sm font-bold" placeholder="name@email.com" /></div></div>
                            <button type="submit" disabled={isLoading} className="w-full py-6 bg-[#002135] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send reset link</>}</button>
                        </form>
                    )}
                </div>
            </div>
          )}

          {view === 'form' && (
              <div className="w-full animate-slide-up text-left flex-1">
                  <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 hover:text-[#002135] transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                      <h3 className="text-3xl text-[#002135] mb-8 font-black tracking-tight">{mode === 'signin' ? 'Welcome back' : `New ${selectedRole.toLowerCase()} account`}</h3>
                      {errorMessage && (
                          <div className="mb-6 space-y-3 animate-fade-in">
                              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-700 font-bold leading-tight">{errorMessage}</p></div>
                              {showSignInOption && (
                                  <button 
                                      type="button"
                                      onClick={() => { setMode('signin'); setView('form'); setErrorMessage(''); setShowSignInOption(false); setEmail(''); setPassword(''); }}
                                      className="w-full py-3 bg-blue-50 text-blue-700 rounded-[1.5rem] text-xs font-black uppercase tracking-widest border-2 border-blue-200 hover:bg-blue-100 transition-all"
                                  >
                                      Sign In Instead
                                  </button>
                              )}
                          </div>
                      )}
                      <form onSubmit={handleSubmit} className="space-y-6">
                          {mode === 'signup' && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 text-left"><label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Name</label><input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm" /></div>
                                    <div className="space-y-1 text-left"><label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Surname</label><input type="text" required value={surname} onChange={e => setSurname(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm" /></div>
                                </div>
                                {selectedRole === UserRole.PARENT && (
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Relationship to student</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Mother', 'Father', 'Other'].map(option => (
                                                <button 
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setSelectedRelationship(option)}
                                                    className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${selectedRelationship === option ? 'bg-[#002135] border-[#002135] text-white shadow-lg shadow-brand-navy/20' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedRelationship === 'Other' && (
                                            <div className="mt-3 animate-fade-in">
                                                <div className="relative">
                                                    <Heart className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <input 
                                                        type="text" 
                                                        required 
                                                        value={customRelationship} 
                                                        onChange={e => setCustomRelationship(e.target.value)} 
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm" 
                                                        placeholder="Specify relationship (e.g. Aunt)" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Select your school</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        {isFetchingSchools ? (
                                            <div className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-400 flex items-center gap-3">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Fetching list...
                                            </div>
                                        ) : schools.length === 0 ? (
                                            <div className="w-full pl-14 pr-6 py-4 bg-red-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-red-500">
                                                No schools found.
                                            </div>
                                        ) : (
                                            <select 
                                                value={selectedSchoolId} 
                                                onChange={e => setSelectedSchoolId(e.target.value)} 
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none appearance-none font-bold text-sm"
                                            >
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        )}
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                    </div>
                                </div>
                                {selectedRole !== UserRole.PRINCIPAL && (
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">
                                            {selectedRole === UserRole.TEACHER ? 'Select multiple grades' : 'Grade level'}
                                        </label>
                                        
                                        {selectedRole === UserRole.TEACHER ? (
                                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 max-h-40 overflow-y-auto hide-scrollbar">
                                                {filteredGrades.map(g => {
                                                    const isSelected = teacherGrades.includes(g);
                                                    return (
                                                        <button 
                                                            key={g}
                                                            type="button"
                                                            onClick={() => toggleTeacherGrade(g)}
                                                            className={`py-2 rounded-xl border-2 font-bold text-[10px] transition-all ${isSelected ? 'bg-[#002135] border-[#002135] text-white' : 'bg-white border-slate-100 text-slate-500'}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <select 
                                                            value={selectedGrade} 
                                                            onChange={e => setSelectedGrade(e.target.value)} 
                                                            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none appearance-none font-bold text-sm"
                                                        >
                                                            {filteredGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <select 
                                                            value={selectedClass} 
                                                            onChange={e => setSelectedClass(e.target.value)} 
                                                            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none appearance-none font-bold text-sm"
                                                        >
                                                            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                              </>
                          )}
                          <div className="space-y-1 text-left"><label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Email address</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm" placeholder="name@email.com" /></div>
                          <div className="space-y-1 text-left"><div className="flex justify-between items-center ml-4"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Password</label>{mode === 'signin' && <button type="button" onClick={() => setView('forgot_password')} className="text-[9px] text-[#002135] font-black uppercase tracking-widest hover:text-[#072432] transition-colors">Forgot?</button>}</div><div className="relative"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm" placeholder="••••••••" /></div></div>
                          {mode === 'signup' && (selectedRole === UserRole.TEACHER || selectedRole === UserRole.PRINCIPAL) && (
                              <div className="space-y-3">
                                  <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-[1.5rem] flex items-start gap-3">
                                      <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                      <p className="text-[10px] text-blue-700 font-bold leading-snug">Only verified educators can register. You'll need the secure passkey provided by your school.</p>
                                  </div>
                                  <div className="space-y-1 text-left"><label className="text-[10px] text-slate-500 ml-4 font-black uppercase tracking-widest">Educator Passkey *</label><div className="relative"><Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="password" required value={passkey} onChange={e => setPasskey(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-brand-teal focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm" placeholder="••••••••" /></div><p className="text-[9px] text-slate-400 ml-4 mt-1">Contact your school administrator if you don't have the passkey</p></div>
                              </div>
                          )}
                          <button type="submit" disabled={isLoading || (mode === 'signup' && schools.length === 0) || (mode === 'signup' && (selectedRole === UserRole.TEACHER || selectedRole === UserRole.PRINCIPAL) && !passkey)} className="w-full py-6 bg-[#002135] text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4">{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{mode === 'signin' ? 'Sign in' : 'Continue to access'}</>}</button>
                      </form>
                  </div>
              </div>
          )}
        </div>
        <div className="text-center space-y-4"><div className="flex items-center justify-center gap-4 text-slate-300"><Shield className="w-4 h-4" /><Smartphone className="w-4 h-4" /><Lock className="w-4 h-4" /></div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure education platform © 2024</p></div>
      </div>
    </div>
  );
};

export default LoginScreen;