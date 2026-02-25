
import React from 'react';
import { Shield, Lock, Server, UserCheck, Globe, Info, Trash2, Download, Users } from 'lucide-react';

const PrivacyPolicyModule: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32 text-left">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-10 h-10 bg-[#072432] rounded-lg text-[#00ff8e] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Privacy Policy</h2>
      </div>

      <p className="text-slate-600 text-sm font-medium mb-6 px-4">Last Updated: February 6, 2026 • For Educater at www.educater.co.za</p>

      <div className="space-y-8 text-slate-700">
        {/* 1. Introduction */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-[#00ff8e]" />
            1. Introduction
          </h2>
          <p className="text-sm leading-relaxed">
            Educater ("we", "us", "our", or "Company") operates educational platform at www.educater.co.za and related applications. This privacy policy explains how we collect, use, disclose, and protect your personal data when you use our educational platform and services.
          </p>
        </section>

        {/* 2. Data We Collect */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00ff8e]" />
            2. Data We Collect
          </h2>
          <div className="space-y-3 text-sm">
            <p><strong>Account Information:</strong> Email, full name, grade level, role (student/teacher/parent/principal), profile picture</p>
            <p><strong>School Data:</strong> School name, institution ID, grade association, class information</p>
            <p><strong>Communication Data:</strong> Chat messages, announcements, homework submissions, notifications</p>
            <p><strong>Device Data:</strong> Device type, push notification tokens for delivering notifications</p>
            <p><strong>Usage Analytics:</strong> App features used, login frequency, timestamps</p>
          </div>
        </section>

        {/* 3. Purpose of Collection */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#00ff8e]" />
            3. Purpose of Data Collection
          </h2>
          <div className="space-y-3 text-sm">
            <p>• Provide and maintain our educational services</p>
            <p>• Send push notifications related to homework, announcements, and alerts</p>
            <p>• Process payments for premium services</p>
            <p>• Improve app functionality and user experience</p>
            <p>• Comply with legal obligations and school policies</p>
            <p>• Ensure security and prevent fraud or misuse</p>
          </div>
        </section>

        {/* 4. Third-Party Services */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Server className="w-6 h-6 text-[#00ff8e]" />
            4. Third-Party Services
          </h2>
          <div className="space-y-3 text-sm">
            <p><strong>Firebase (Google):</strong> Authentication, database storage, file storage, analytics. Data stored in accordance with Google's terms.</p>
            <p><strong>Payment Processing:</strong> Payment information is processed securely by third-party payment providers. We do not store payment card details on our servers.</p>
            <p><strong>Push Notifications:</strong> For device users, push notifications are delivered through device-specific notification services. Device tokens are used only for notification delivery.</p>
          </div>
        </section>

        {/* 5. Data Security */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#00ff8e]" />
            5. Data Security
          </h2>
          <div className="space-y-3 text-sm">
            <p>• All data in transit is encrypted using modern SSL/TLS protocols</p>
            <p>• Firebase provides security through Google Cloud's infrastructure</p>
            <p>• We enforce authentication and authorization controls</p>
            <p>• Regular security audits and updates are performed</p>
            <p>• Access to personal data is restricted to authorized personnel only</p>
          </div>
        </section>

        {/* 6. User Rights */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#00ff8e]" />
            6. Your Data Rights
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-bold flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Your Account</p>
              <p className="mt-1 text-slate-600">You can request account deletion at any time. Go to Settings → Account → Delete Account, or contact us at support@educater.co.za. Your data will be permanently deleted from our systems within 30 days.</p>
            </div>
            <div>
              <p className="font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Export Your Data</p>
              <p className="mt-1 text-slate-600">Request a copy of your personal data by contacting support@educater.co.za. We will provide your data in a standard, machine-readable format.</p>
            </div>
            <div>
              <p className="font-bold">Withdraw Consent</p>
              <p className="mt-1 text-slate-600">You can withdraw consent for specific data processing at any time through your app settings or by contacting us.</p>
            </div>
          </div>
        </section>

        {/* 7. No Data Sale */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4">7. We Do Not Sell Your Data</h2>
          <p className="text-sm">
            Educater strictly prohibits the sale of student, parent, or teacher data to third parties, advertisers, or data brokers. Your data is used exclusively to provide educational services. We are funded through school institutional licenses and optional premium parent subscriptions.
          </p>
        </section>

        {/* 8. Children's Privacy */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4">8. Children's Privacy</h2>
          <p className="text-sm">
            Our app is used by students under 18 years old. We collect student data only as necessary for educational purposes and with appropriate parent/guardian consent through school enrollment. We do not use children's data for advertising or marketing purposes.
          </p>
        </section>

        {/* 9. Contact Us */}
        <section className="bg-[#00ff8e]/5 p-8 rounded-2xl border border-[#00ff8e]/20">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#00ff8e]" />
            9. Contact Us
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> info@educater.co.za</p>
            <p><strong>Website:</strong> www.educater.co.za</p>
            <p>For privacy concerns, data requests, or account deletion, please contact us using the above details. We will respond within 14 business days.</p>
          </div>
        </section>

        <div className="text-center text-xs text-slate-500 pt-8">
          <p>This privacy policy is effective as of February 6, 2026 and may be updated periodically.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModule;
