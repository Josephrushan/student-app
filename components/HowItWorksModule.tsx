
import React from 'react';
import { User, UserRole } from '../types';
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  Camera, 
  Trophy, 
  MessageCircle, 
  ShieldCheck, 
  Heart, 
  Bell, 
  UserPlus, 
  Megaphone, 
  AlertTriangle, 
  GraduationCap,
  User as UserIcon,
  Users,
  Book,
  Layout as LayoutIcon,
  CheckCircle2
} from 'lucide-react';

interface HowItWorksModuleProps {
  currentUser: User;
}

const HowItWorksModule: React.FC<HowItWorksModuleProps> = ({ currentUser }) => {
  const isStudent = currentUser.role === UserRole.STUDENT;
  const isParent = currentUser.role === UserRole.PARENT;
  const isTeacher = currentUser.role === UserRole.TEACHER;
  const isPrincipal = currentUser.role === UserRole.PRINCIPAL;

  const FeatureCard = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group text-left">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* High-Impact Theme Header */}
      <div className="relative bg-[#072432] rounded-[3.5rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl shadow-slate-200 text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff8e]/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <Compass className="w-4 h-4 text-[#00ff8e]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Guide</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Digital <span className="text-[#00ff8e]">Playbook.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
            Welcome to your new digital campus. This guide explores how to maximize the platform based on your specific role.
          </p>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-[#00ff8e] fill-[#00ff8e]" /> Platform Highlights
        </h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">What makes this app special</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Living Journal</h4>
            <p className="text-sm text-slate-500 font-medium">Post photos and memories of school days. A private social network for your class to cherish moments.</p>
          </div>

          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LayoutIcon className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Centralized Hub</h4>
            <p className="text-sm text-slate-500 font-medium">Everything from homework and chat to yearbook and notices is organized in one clean dashboard.</p>
          </div>

          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Safe & Verified</h4>
            <p className="text-sm text-slate-500 font-medium">A closed loop environment where only verified members of your school community can interact.</p>
          </div>
        </div>
      </div>

      {/* Role-Specific Guide */}
      <div className="space-y-8">
        <div className="text-left px-4">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Features for <span className="text-[#072432]">{currentUser.role}s</span></h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Customized for your role in the community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isStudent && (
            <>
              <FeatureCard 
                icon={Trophy} 
                title="Yearbook Voting" 
                description="Like your favorite Journal memories! The most popular moments are nominated for the official Digital Yearbook." 
                color="bg-amber-500"
              />
              <FeatureCard 
                icon={CheckCircle2} 
                title="Task Tracker" 
                description="Keep track of every assignment. Mark tasks as 'Finished' to update your teachers and parents on your progress." 
                color="bg-indigo-600"
              />
              <FeatureCard 
                icon={MessageCircle} 
                title="Monitored Peer Chat" 
                description="Chat with your classmates in a safe, educator-monitored space for school projects or social catch-ups." 
                color="bg-emerald-500"
              />
              <FeatureCard 
                icon={UserIcon} 
                title="Digital Identity" 
                description="Set up your profile with a personalized bio and fun facts for your classmates to see in the peer directory." 
                color="bg-pink-500"
              />
            </>
          )}

          {isParent && (
            <>
              <FeatureCard 
                icon={Bell} 
                title="Absence & Health Alerts" 
                description="Get instant notifications if your child is marked absent or unwell. Chat directly with the teacher inside the alert card." 
                color="bg-red-500"
              />
              <FeatureCard 
                icon={UserPlus} 
                title="Multi-Child Control" 
                description="Link all your children to one account. Toggle between their grades to see their specific homework and news." 
                color="bg-indigo-600"
              />
              <FeatureCard 
                icon={BookOpen} 
                title="Curated Resources" 
                description="Access teacher-approved revision materials, videos, and lesson plans to support your child's learning journey." 
                color="bg-blue-500"
              />
              <FeatureCard 
                icon={Users} 
                title="Verified Directory" 
                description="Look up and securely contact other parents or staff members in your school to coordinate and stay informed." 
                color="bg-emerald-500"
              />
            </>
          )}

          {isTeacher && (
            <>
              <FeatureCard 
                icon={BookOpen} 
                title="Assignment Center" 
                description="Post homework with attachments and due dates. Monitor who has completed their tasks in real-time." 
                color="bg-indigo-600"
              />
              <FeatureCard 
                icon={AlertTriangle} 
                title="Rapid Alert System" 
                description="Quickly log student absences or illnesses. The system automatically triggers high-priority alerts for parents." 
                color="bg-red-500"
              />
              <FeatureCard 
                icon={Megaphone} 
                title="Staff Noticeboard" 
                description="Send school-wide notices that are strictly staff-only. Perfect for term updates and administrative announcements." 
                color="bg-amber-600"
              />
              <FeatureCard 
                icon={Camera} 
                title="Memory Curator" 
                description="Upload photos to the Journal. You decide which moments become the basis for the grade's digital yearbook." 
                color="bg-pink-500"
              />
            </>
          )}

          {isPrincipal && (
            <>
              <FeatureCard 
                icon={GraduationCap} 
                title="Campus Oversight" 
                description="Full access to the staff bulletin and school directory. Monitor community interactions across all grade levels." 
                color="bg-[#072432]"
              />
              <FeatureCard 
                icon={Megaphone} 
                title="Global Bulletins" 
                description="Broadcast high-priority notices to your entire teaching staff instantly from your specialized principal dashboard." 
                color="bg-indigo-600"
              />
              <FeatureCard 
                icon={Book} 
                title="Yearbook Publisher" 
                description="Finalize the yearbook layout, set the principal's message, and download the finished version as a print-ready PDF." 
                color="bg-amber-600"
              />
              <FeatureCard 
                icon={ShieldCheck} 
                title="Moderation Control" 
                description="Review chat logs and directory profiles to ensure your digital school remains a positive and safe environment." 
                color="bg-emerald-600"
              />
            </>
          )}
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#072432] shadow-inner">
            <Heart className="w-8 h-8 fill-[#072432]" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to explore?</h3>
        <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">Use the menu on the left to jump into your favorite feature. We're glad to have you in the community!</p>
        <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-10 py-4 bg-[#072432] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 shadow-xl transition-all active:scale-95"
        >
            Back to Top
        </button>
      </div>
    </div>
  );
};

export default HowItWorksModule;
