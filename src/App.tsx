/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, Exam, Question, ExamAttempt, Certificate, AdminSettings, Notification 
} from "./types";
import { 
  initialQuestions, initialExams, initialNotifications, initialSettings 
} from "./data/initialData";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import { StudentDashboard } from "./components/StudentDashboard";
import { ExamEngine } from "./components/ExamEngine";
import { Leaderboard } from "./components/Leaderboard";
import { CertificateVerification } from "./components/CertificateVerification";
import { AdminPanel } from "./components/AdminPanel";
import { 
  Award, Bell, BookOpen, BrainCircuit, Globe, LayoutDashboard, 
  LogOut, Phone, ShieldCheck, Trophy, User as UserIcon, Lock, AtSign, Building
} from "lucide-react";

function MainApp() {
  const { language, setLanguage, t } = useLanguage();
  
  // Navigation state
  const [currentView, setCurrentView] = useState<"dashboard" | "leaderboard" | "verify" | "admin">("dashboard");

  // Core Entity collections states (backed by LocalStorage databases)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form inputs cache
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regClass, setRegClass] = useState("Class 10");
  const [regId, setRegId] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Exam engine session state
  const [activeRunningExam, setActiveRunningExam] = useState<Exam | null>(null);
  const [lastFinishedAttempt, setLastFinishedAttempt] = useState<ExamAttempt | null>(null);
  const [lastFinishedCertificate, setLastFinishedCertificate] = useState<Certificate | null>(null);

  // Initialize DB and bootstrap static structures
  useEffect(() => {
    // 1. Questions database bootstrapping
    const storedQs = localStorage.getItem("smart_quiz_questions");
    if (storedQs) {
      setQuestions(JSON.parse(storedQs));
    } else {
      setQuestions(initialQuestions);
      localStorage.setItem("smart_quiz_questions", JSON.stringify(initialQuestions));
    }

    // 2. Exams database bootstrapping
    const storedExs = localStorage.getItem("smart_quiz_exams");
    if (storedExs) {
      setExams(JSON.parse(storedExs));
    } else {
      setExams(initialExams);
      localStorage.setItem("smart_quiz_exams", JSON.stringify(initialExams));
    }

    // 3. Announcements database bootstrapping
    const storedNotifs = localStorage.getItem("smart_quiz_notifications");
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      setNotifications(initialNotifications);
      localStorage.setItem("smart_quiz_notifications", JSON.stringify(initialNotifications));
    }

    // 4. Branding settings bootstrapping
    const storedSettings = localStorage.getItem("smart_quiz_settings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(initialSettings);
      localStorage.setItem("smart_quiz_settings", JSON.stringify(initialSettings));
    }

    // 5. Auth recovery session bootstrapping
    const rememberedUser = localStorage.getItem("smart_quiz_remembered_session");
    if (rememberedUser) {
      setCurrentUser(JSON.parse(rememberedUser));
    }

    // Bootstrap default student users for first interaction demo
    const existingUsers = localStorage.getItem("smart_quiz_users");
    if (!existingUsers) {
      const demoUsers = [
        { id: "usr-demo", fullName: "Imtiaz Hassan", phone: "01700000000", email: "student@quiz.pro", institution: "Dhaka University", studentClass: "Honors 2nd Year", studentId: "DU-9988-SD", password: "student123", registrationDate: new Date().toISOString() }
      ];
      localStorage.setItem("smart_quiz_users", JSON.stringify(demoUsers));
    }
  }, []);

  // Sync state mutations directly back to storage
  const handleUpdateQuestionsList = (updated: Question[]) => {
    setQuestions(updated);
    localStorage.setItem("smart_quiz_questions", JSON.stringify(updated));
  };

  const handleUpdateExamsList = (updated: Exam[]) => {
    setExams(updated);
    localStorage.setItem("smart_quiz_exams", JSON.stringify(updated));
  };

  const handleUpdateBrandingSettings = (updated: AdminSettings) => {
    setSettings(updated);
    localStorage.setItem("smart_quiz_settings", JSON.stringify(updated));
  };

  const handleAddBroadcastNotification = (notification: Notification) => {
    const updated = [notification, ...notifications];
    setNotifications(updated);
    localStorage.setItem("smart_quiz_notifications", JSON.stringify(updated));
  };

  // Student registration controller
  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName || !regPhone || !regEmail || !regInstitution || !regId || !regPassword) {
      alert(language === "en" ? "Please fill in all details required inside the registration sheet." : "দয়া করে নিবন্ধনের জন্য সকল নির্ভুল তথ্য পূরণ করুন।");
      return;
    }

    const cachedUsersStr = localStorage.getItem("smart_quiz_users") || "[]";
    const cachedUsers: any[] = JSON.parse(cachedUsersStr);

    const exists = cachedUsers.some(u => u.phone === regPhone);
    if (exists) {
      alert(language === "en" ? "Mobile number already registered. Try logging in." : "এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যেই একাউন্ট খোলা হয়েছে। দয়া করে লগইন করুন।");
      return;
    }

    const newUser: User & { password?: string } = {
      id: `usr-${Date.now()}`,
      fullName: regName,
      phone: regPhone,
      email: regEmail,
      institution: regInstitution,
      studentClass: regClass,
      studentId: regId,
      registrationDate: new Date().toISOString(),
      password: regPassword,
    };

    cachedUsers.push(newUser);
    localStorage.setItem("smart_quiz_users", JSON.stringify(cachedUsers));

    // Clear password before setting profile state
    const { password, ...cleanProfile } = newUser;
    setCurrentUser(cleanProfile);

    if (rememberMe) {
      localStorage.setItem("smart_quiz_remembered_session", JSON.stringify(cleanProfile));
    }

    alert(language === "en" ? "Profile created successfully!" : "নতুন কুইজ একাউন্ট সফলভাবে নিবন্ধিত হয়েছে!");
  };

  // Student login auth controller
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginPhone || !loginPassword) return;

    const cachedUsersStr = localStorage.getItem("smart_quiz_users") || "[]";
    const cachedUsers: any[] = JSON.parse(cachedUsersStr);

    // Default password fallback handles "student123" for quick demos
    const foundUser = cachedUsers.find(u => u.phone === loginPhone && (u.password === loginPassword || loginPassword === "student123"));

    if (foundUser) {
      const { password, ...cleanProfile } = foundUser;
      setCurrentUser(cleanProfile);

      if (rememberMe) {
        localStorage.setItem("smart_quiz_remembered_session", JSON.stringify(cleanProfile));
      }

      alert(language === "en" ? "Welcome back!" : "স্মার্ট কুইজ প্ল্যাটফর্মে আপনাকে স্বাগতম!");
    } else {
      alert(language === "en" ? "Invalid login coordinates. Try using phone '01700000000' and pass 'student123'." : "ভুল মোবাইল নম্বর বা পাসওয়ার্ড। ডেমোর জন্য ফোন '01700000000' এবং পাসওয়ার্ড 'student123' ব্যবহার করুন।");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("smart_quiz_remembered_session");
    setCurrentView("dashboard");
  };

  // Exam taking completed callback
  const handleExamFinishedEvent = (attempt: ExamAttempt, certificate?: Certificate) => {
    setActiveRunningExam(null);
    setLastFinishedAttempt(attempt);
    if (certificate) {
      setLastFinishedCertificate(certificate);
    } else {
      setLastFinishedCertificate(null);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased"
      style={{
        // Custom highlights based on primary color setup
        "--primary-glow": settings.primaryColor,
      } as React.CSSProperties}
    >
      {/* Dynamic Cyber Orbs behind content */}
      <div className="absolute top-[-100px] left-[10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Universal Glassmorphism Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/60 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Brand Identity Branding Logo */}
          <div 
            onClick={() => { if (!activeRunningExam) setCurrentView("dashboard"); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 group-hover:border-cyan-500/60 transition-colors">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-left font-serif">
              <span className="text-base font-bold font-serif text-slate-50 tracking-tight block">
                {settings.websiteName}
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mt-0.5">
                {language === "en" ? "PRO PLATFORM" : "প্রো প্ল্যাটফর্ম"}
              </span>
            </div>
          </div>

          {/* Navigation link directories */}
          {!activeRunningExam && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {[
                { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
                { id: "leaderboard", label: t("leaderboard"), icon: Trophy },
                { id: "verify", label: t("verifyCertificate"), icon: ShieldCheck },
                { id: "admin", label: t("adminPanel"), icon: Lock },
              ].map((view) => {
                const Icon = view.icon;
                const active = currentView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      active 
                        ? "bg-slate-800 text-cyan-400 font-bold border border-slate-700/60" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{view.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Universal control tools: bilingual selection & Auth status */}
          <div className="flex items-center gap-3">
            
            {/* Language Selection toggle switch */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 text-3xs font-bold rounded-md transition-all ${
                  language === "en" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-500"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`px-2.5 py-1 text-3xs font-bold rounded-md transition-all ${
                  language === "bn" ? "bg-slate-800 text-cyan-400 shadow-sm" : "text-slate-500"
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Auth panel */}
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] font-bold text-slate-100 block truncate max-w-[120px] font-serif pr-1">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[8px] text-cyan-400/80 font-mono tracking-wider block mt-0.5">
                    ID: {currentUser.studentId}
                  </span>
                </div>
                {!activeRunningExam && (
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-slate-90/30 hover:bg-rose-950/40 hover:text-rose-400 rounded-lg text-slate-500 transition-all cursor-pointer border border-slate-800"
                    title={t("logout")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              !activeRunningExam && (
                <button
                  onClick={() => { setAuthMode("login"); setCurrentView("dashboard"); }}
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  {t("login")}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* 2. Primary Page layout grid container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10 relative flex flex-col items-center justify-center">

        {/* Dynamic Warning Result Modal on Completing Exam */}
        {lastFinishedAttempt && (
          <div className="fixed inset-0 z-50 bg-slate-95 /80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative text-center select-none animate-scale-up font-sans">
              
              {/* Highlight background glowing flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-full mb-3">
                <Trophy className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-50 font-serif">
                {language === "en" ? "Assessment Complete!" : "পরীক্ষা সম্পন্ন হয়েছে!"}
              </h2>
              <p className="text-xs text-slate-450 mt-1">
                {language === "en" ? "Your score parameters have been registered on Sheets database." : "আপনার ফলাফল বিবরণী যথাযথভাবে স্প্রেডশিট ফাইলে সেভ করা হয়েছে।"}
              </p>

              {/* Statistics proportions result box */}
              <div className="grid grid-cols-2 gap-3 mt-5 p-4 bg-slate-950/60 border border-slate-850 rounded-xl font-sans text-left text-xs">
                <div>
                  <span className="text-xxs text-slate-500 uppercase">{t("score")}</span>
                  <span className="text-base font-bold text-slate-200 block mt-0.5">{lastFinishedAttempt.score} Points</span>
                </div>
                <div>
                  <span className="text-xxs text-slate-500 uppercase">{t("percentage")}</span>
                  <span className="text-base font-bold text-slate-200 block mt-0.5">{lastFinishedAttempt.percentage}%</span>
                </div>
                <div>
                  <span className="text-xxs text-slate-500 uppercase">{t("grade")}</span>
                  <span className="text-base font-bold text-slate-200 block mt-0.5 font-mono">{lastFinishedAttempt.grade}</span>
                </div>
                <div>
                  <span className="text-xxs text-slate-500 uppercase">{language === "en" ? "Cheat Log Warnings" : "অ্যান্টি-চিট রেকর্ড"}</span>
                  <span className={`text-sm font-bold block mt-0.5 font-mono ${lastFinishedAttempt.cheatWarningsTriggered > 0 ? "text-amber-500" : "text-emerald-450"}`}>
                    {lastFinishedAttempt.cheatWarningsTriggered} / 3
                  </span>
                </div>
              </div>

              {/* Success Certificate action ribbon */}
              {lastFinishedAttempt.passed && lastFinishedCertificate ? (
                <div className="mt-5 p-4 bg-amber-955/20 border border-amber-500/20 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-2 text-amber-400 justify-center">
                    <ShieldCheck className="w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{language === "en" ? "Verification Certificate Issued!" : "সার্টিফিকেট অনুমোদিত হয়েছে!"}</span>
                  </div>
                  <p className="text-xxs text-slate-400 leading-relaxed">
                    {language === "en" ? "Congratulations! You have cleared all assessed rules with excellence." : "অভিনন্দন! আপনি সফল মেধার পরিচয় দিয়ে উত্তীর্ণ হয়েছেন এবং অনন্য সনদ অর্জনে সক্ষম হয়েছেন।"}
                  </p>
                </div>
              ) : (
                <div className="mt-5 p-4 bg-rose-955/20 border border-rose-500/20 rounded-xl">
                  <p className="text-xxs text-rose-300">
                    {language === "en" 
                      ? "Unfortunately, you were unable to clear the point boundaries this time. Try again!" 
                      : "দুঃখিত, আপনি উক্ত পরীক্ষায় উত্তীর্ণ হতে পারেননি। আশাহত না হয়ে প্রস্তুতি নিয়ে পুনরায় চেষ্টা করুন।"}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setLastFinishedAttempt(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {language === "en" ? "Back to Dashboard" : "ড্যাশবোর্ডে ফিরে যান"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Gated views check: If not logged in and not verifying certificate, force Registration or Login forms first */}
        {!currentUser && currentView !== "verify" && currentView !== "admin" ? (
          <div className="w-full max-w-md bg-slate-900 border border-slate-80& rounded-2xl p-6 md:p-8 relative shadow-2xl relative overflow-hidden text-left animate-fade-in font-sans">
            
            {/* Glowing orb highlight */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center space-y-2 mb-6 select-none">
              <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-indigo-500 font-bold font-mono px-3 py-1 rounded inline-block text-slate-950 tracking-wider">
                {t("appName").toUpperCase()}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif pt-1">
                {authMode === "login" ? t("welcomeBack") : t("createAccount")}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                {t("tagline")}
              </p>
            </div>

            {authMode === "login" ? (
              /* A. STUDENT LOGIN FORM PORTAL */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5 pl-0.5">
                    <Phone className="w-3" />
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="E.g. 01700000000"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5 pl-0.5">
                    <Lock className="w-3" />
                    {t("password")}
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-750 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="student123"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-2 select-none cursor-pointer text-xxs text-slate-450 pl-0.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span>{t("rememberMe")}</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t("login").toUpperCase()}
                </button>

                <p className="text-xxs text-slate-500 text-center select-none pt-2">
                  {t("dontHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="text-cyan-400 font-bold underline"
                  >
                    {t("register")}
                  </button>
                </p>
              </form>
            ) : (
              /* B. STUDENT REGISTRATION FORM PORTAL */
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5">{t("fullName")}</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500"
                      placeholder="Imtiaz Hassan"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5">{t("phone")}</label>
                    <input
                      type="tel"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500"
                      placeholder="01700000000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5 flex items-center gap-1.5"><AtSign className="w-3" />{t("email")}</label>
                    <input
                      type="email"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. imtiaz@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5 flex items-center gap-1.5"><Building className="w-3" />{t("institution")}</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500"
                      placeholder="E.g. Dhaka University"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5">{t("studentClass")}</label>
                    <select
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                    >
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="University Undergraduate">University Undergraduate</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5">{t("studentId")}</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500"
                      placeholder="ID (e.g. DU-889)"
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-semibold pl-0.5">{t("password")}</label>
                  <input
                    type="password"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-800 focus:outline-none focus:border-cyan-500"
                    placeholder="student123"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-2 select-none cursor-pointer text-xxs text-slate-450 pl-0.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span>{t("rememberMe")}</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  {t("createAccount").toUpperCase()}
                </button>

                <p className="text-xxs text-slate-500 text-center select-none pt-2">
                  {t("alreadyHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-cyan-400 font-bold underline text-xxs"
                  >
                    {t("login")}
                  </button>
                </p>
              </form>
            )}
          </div>
        ) : (
          /* 3. CORE VIEWS DIRECTORY LOGS */
          <div className="w-full">
            {/* ACTIVE EXAM RUNNING PORTAL */}
            {activeRunningExam && currentUser ? (
              <ExamEngine 
                exam={activeRunningExam}
                questions={questions}
                userId={currentUser.fullName}
                userName={currentUser.fullName}
                studentId={currentUser.studentId}
                onFinished={handleExamFinishedEvent}
                onExit={() => setActiveRunningExam(null)}
              />
            ) : (
              /* INDIVIDUAL TAB DIRECTORIES */
              <div className="w-full">
                {currentView === "dashboard" && currentUser && (
                  <StudentDashboard 
                    exams={exams}
                    userId={currentUser.fullName}
                    userName={currentUser.fullName}
                    studentId={currentUser.studentId}
                    onStartExam={(exam) => setActiveRunningExam(exam)}
                    notifications={notifications}
                  />
                )}

                {currentView === "leaderboard" && (
                  <Leaderboard />
                )}

                {currentView === "verify" && (
                  <CertificateVerification />
                )}

                {currentView === "admin" && (
                  <AdminPanel 
                    questions={questions}
                    onUpdateQuestions={handleUpdateQuestionsList}
                    exams={exams}
                    onUpdateExams={handleUpdateExamsList}
                    settings={settings}
                    onUpdateSettings={handleUpdateBrandingSettings}
                    notifications={notifications}
                    onAddNotification={handleAddBroadcastNotification}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Glass footer coordinates section logs */}
      <footer className="mt-12 bg-slate-950 border-t border-slate-90/50 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
          <p className="font-sans">
            © 2026 {settings.websiteName}. All Rights Reserved. Designed for premium dynamic exam validation in Bangladesh.
          </p>

          {/* Social coordination links */}
          <div className="flex gap-4">
            <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 text-xxs font-semibold">Facebook</a>
            <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 text-xxs font-semibold">WhatsApp</a>
            <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 text-xxs font-semibold">Telegram</a>
            <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 text-xxs font-semibold">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
