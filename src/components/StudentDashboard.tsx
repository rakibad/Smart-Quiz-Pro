/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Exam, ExamAttempt, Certificate } from "../types";
import { 
  Award, Calendar, Plus, BookOpen, AlertTriangle, Play, HelpCircle, 
  CheckCircle, RefreshCw, Bell, ShieldCheck, Printer, Trash2
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { CertificateBuilder } from "./CertificateBuilder";

interface StudentDashboardProps {
  exams: Exam[];
  userId: string;
  userName: string;
  studentId: string;
  onStartExam: (exam: Exam) => void;
  notifications: any[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  exams,
  userId,
  userName,
  studentId,
  onStartExam,
  notifications,
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  // Reload history, attempts, and certificates
  useEffect(() => {
    const loadHistory = () => {
      const storedAttempts: ExamAttempt[] = JSON.parse(localStorage.getItem("smart_quiz_attempts") || "[]");
      const userAttempts = storedAttempts.filter(a => a.userId === userId);
      setAttempts(userAttempts);

      const storedCerts: Certificate[] = JSON.parse(localStorage.getItem("smart_quiz_certs") || "[]");
      const userCerts = storedCerts.filter(c => c.userId === userId);
      setCerts(userCerts);
    };

    loadHistory();
    // Listening for updates
    window.addEventListener("storage", loadHistory);
    return () => window.removeEventListener("storage", loadHistory);
  }, [userId]);

  const categories = ["All", ...Array.from(new Set(exams.map(e => e.category)))];

  const filteredExams = selectedCategory === "All" 
    ? exams.filter(e => e.published)
    : exams.filter(e => e.category === selectedCategory && e.published);

  // Calculate metrics
  const totalExamsCompleted = attempts.length;
  const passedCount = attempts.filter(a => a.passed).length;
  const passRate = totalExamsCompleted > 0 ? Math.round((passedCount / totalExamsCompleted) * 100) : 0;
  const highestPercent = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;

  const handleClearHistory = () => {
    if (confirm(language === "en" ? "Are you sure you want to clear your local exam history?" : "আপনি কি আপনার পরীক্ষার ইতিহাস ও রেকর্ড মুছে ফেলার ব্যাপারে নিশ্চিত?")) {
      const storedAttempts: ExamAttempt[] = JSON.parse(localStorage.getItem("smart_quiz_attempts") || "[]");
      const filtered = storedAttempts.filter(a => a.userId !== userId);
      localStorage.setItem("smart_quiz_attempts", JSON.stringify(filtered));

      const storedCerts: Certificate[] = JSON.parse(localStorage.getItem("smart_quiz_certs") || "[]");
      const filteredCerts = storedCerts.filter(c => c.userId !== userId);
      localStorage.setItem("smart_quiz_certs", JSON.stringify(filteredCerts));

      setAttempts([]);
      setCerts([]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in mt-2">
      {/* 1. Welcoming Hero with statistics panels */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800/85 overflow-hidden shadow-xl text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div>
            <span className="text-xxs uppercase tracking-wider font-bold text-cyan-400 font-mono">
              ★ {language === "en" ? "Academic Dashboard" : "একাডেমিক ড্যাশবোর্ড"}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-100 tracking-tight mt-1">
              {t("welcomeBack")}, {userName}!
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              {language === "en" 
                ? "Improve your knowledge, earn certified badges, and track your metrics in real time."
                : "আপনার পারফরম্যান্স ও দক্ষতা উন্নত করুন, লাইভ ভেরিফাইড সার্টিফিকেট অর্জন করুন এবং রেকর্ড ট্র্যাক করুন।"}
            </p>
          </div>

          {/* Micro Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-4 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xxs text-slate-500 font-medium block uppercase tracking-wider">{language === "en" ? "Exams Taken" : "অংশগ্রহণকৃত পরীক্ষা"}</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-cyan-400 block mt-1">{totalExamsCompleted}</span>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xxs text-slate-500 font-medium block uppercase tracking-wider">{language === "en" ? "Success Pass Rate" : "পাশের হার"}</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400 block mt-1">{passRate}%</span>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xxs text-slate-500 font-medium block uppercase tracking-wider">{language === "en" ? "Highest Score" : "সর্বোচ্চ প্রাপ্তি"}</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-amber-500 block mt-1">{highestPercent}%</span>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xxs text-slate-500 font-medium block uppercase tracking-wider">{language === "en" ? "Certificates Held" : "অর্জিত সার্টিফিকেটসমূহ"}</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-indigo-400 block mt-1">{certs.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main content grids: Available exams + announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Category filter and Available Exams */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold font-serif text-slate-100 tracking-tight">
              {t("availableExams")}
            </h2>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 border border-slate-850 rounded-lg">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xxs font-semibold rounded-md transition-all ${
                    selectedCategory === cat 
                      ? "bg-slate-850 text-cyan-400 shadow-sm" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat === "All" ? t("allCategories") : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Cards lists */}
          {filteredExams.length === 0 ? (
            <div className="p-12 bg-slate-90/40 border border-slate-850 rounded-xl text-center text-slate-500 text-sm">
              <BookOpen className="w-8 h-8 text-slate-650 mx-auto mb-2" />
              {t("noExams")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((exam) => {
                const isTaken = attempts.some(a => a.examId === exam.id);
                const passAttempt = attempts.find(a => a.examId === exam.id && a.passed);
                
                return (
                  <div 
                    key={exam.id} 
                    className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-left relative overflow-hidden flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900/60 transition-all select-none group"
                  >
                    {/* Glowing highlight corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono px-2 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/20">
                          {exam.category}
                        </span>
                        {passAttempt ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-sans font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {language === "en" ? "CERTIFIED" : "সার্টিফিকেট প্রাপ্ত"}
                          </span>
                        ) : isTaken ? (
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {language === "en" ? "RE-ATTEMPTABLE" : "পুনরায় অংশ নিন"}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] bg-slate-950 text-amber-500 border border-slate-850/60 font-bold px-1.5 py-0.5 rounded font-mono">
                            {exam.quizType === "speed_run" ? "⚡ SPEED RUN" : exam.quizType === "scholar" ? "🏆 SCHOLAR" : exam.quizType === "practice" ? "📝 PRACTICE" : "🎓 REGULAR"}
                          </span>
                          {exam.isQuestionTimerEnabled && (
                            <span className="text-[9px] bg-red-950/40 border border-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded font-mono">
                              ⌛ {exam.questionTimerSeconds}s / Q
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors font-serif truncate">
                          {exam.title}
                        </h3>
                        <p className="text-xxs text-slate-500 mt-1 font-sans">
                          {language === "en" ? "Pass Rate threshold: " : "পাস করার যোগ্যতা হার: "}
                          <span className="font-semibold text-slate-300">{exam.passPercentage}%</span>
                        </p>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-850 text-center font-mono text-xs">
                        <div>
                          <span className="text-[9px] block text-slate-500 uppercase">{t("duration")}</span>
                          <span className="font-bold text-slate-200 mt-0.5 block">{exam.durationMinutes}m</span>
                        </div>
                        <div>
                          <span className="text-[9px] block text-slate-500 uppercase">{t("totalQuestions")}</span>
                          <span className="font-bold text-slate-200 mt-0.5 block">{exam.questionIds.length}</span>
                        </div>
                        <div>
                          <span className="text-[9px] block text-slate-500 uppercase">{t("marks")}</span>
                          <span className="font-bold text-slate-200 mt-0.5 block">{exam.totalMarks}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <button
                        onClick={() => onStartExam(exam)}
                        className="w-full py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500 hover:to-blue-600 border border-cyan-500/30 text-cyan-400 hover:text-slate-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <Play className="w-3.5 block" />
                        {t("startExam")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Micro Notifications / Announcements */}
        <div className="space-y-6 text-left">
          <h2 className="text-xl font-bold font-serif text-slate-100 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400 animate-swing" />
            {t("recentNotifications")}
          </h2>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {notifications.map((notif, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-90/30 border border-slate-850 rounded-xl relative overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute top-0 right-0 w-1.5 h-full bg-cyan-500/30" />
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="px-1.5 py-0.5 bg-slate-850 text-[8px] font-bold text-slate-400 uppercase tracking-widest rounded font-mono">
                      {notif.category || "General"}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(notif.date).toLocaleDateString(language === "en" ? "en-US" : "bn-BD")}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-300 font-sans">
                    {notif.title}
                  </h4>
                  <p className="text-xxs text-slate-400 leading-relaxed font-sans mt-1">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Detailed exam history table */}
      <div className="text-left space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-100 tracking-tight">
              {t("examHistory")}
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {language === "en" 
                ? "Scroll horizontally to see detailed grades and download certificates." 
                : "ডানে স্ক্রোল করে বিস্তারিত গ্রেড ও সার্টিফিকেট অর্জন ডাউনলোড দেখুন।"}
            </p>
          </div>

          {attempts.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-slate-500 hover:text-rose-400 text-xxs font-semibold flex items-center gap-1 border border-slate-800 hover:border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5" />
              {language === "en" ? "Clear Test History" : "টেস্ট হিস্ট্রি মুছুন"}
            </button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="p-12 bg-slate-90/20 border border-slate-850 rounded-xl text-center text-slate-500 text-sm">
            <RefreshCw className="w-8 h-8 text-slate-650 mx-auto mb-2 animate-spin-slow" />
            {t("noHistory")}
          </div>
        ) : (
          <div className="overflow-x-auto w-full border border-slate-800 rounded-xl bg-slate-950 bg-gradient-to-b from-slate-90/40">
            <table className="w-full text-left max-w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider font-mono">
                  <th className="py-3 px-4">{language === "en" ? "Assessment" : "পরীক্ষা"}</th>
                  <th className="py-3 px-4">{language === "en" ? "Attempt Date" : "তারিখ"}</th>
                  <th className="py-3 px-4 text-center">{language === "en" ? "Score / Marks" : "প্রাপ্ত উত্তর"}</th>
                  <th className="py-3 px-4 text-center">{language === "en" ? "Percentage" : "শতাংশ"}</th>
                  <th className="py-3 px-4 text-center">{language === "en" ? "Grade" : "গ্রেড"}</th>
                  <th className="py-3 px-4 text-center">{language === "en" ? "Warnings" : "সতর্কতা"}</th>
                  <th className="py-3 px-4 text-center">{language === "en" ? "Status" : "ফলাফল"}</th>
                  <th className="py-3 px-4 text-center">{language === "en" ? "Certification" : "সার্টিফিকেট"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {attempts.slice().reverse().map((att, idx) => {
                  const correlatedCert = certs.find(c => c.examId === att.examId && c.studentId === studentId);
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-90/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-100 max-w-xs truncate">{att.examTitle}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(att.attemptDate).toLocaleDateString(language === "en" ? "en-US" : "bn-BD")}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-200 font-mono">
                        {att.correctAnswersCount} / {att.correctAnswersCount + att.incorrectAnswersCount}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-100 font-bold font-mono">
                        {att.percentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          att.grade === "A+" || att.grade === "A" 
                            ? "bg-cyan-950/40 border border-cyan-500/20 text-cyan-400" 
                            : att.grade === "B" || att.grade === "C"
                            ? "bg-blue-950/40 border border-blue-500/20 text-blue-400" 
                            : "bg-rose-950/40 border border-rose-500/20 text-rose-400"
                        }`}>
                          {att.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono text-xs ${
                          att.cheatWarningsTriggered > 0 ? "text-amber-500 font-bold" : "text-slate-500"
                        }`}>
                          {att.cheatWarningsTriggered} / 3
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded ${
                          att.passed 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" 
                            : "bg-rose-950 text-rose-400 border border-rose-500/30"
                        }`}>
                          {att.passed ? t("passed") : t("failed")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {att.passed && correlatedCert ? (
                          <button
                            onClick={() => setActiveCert(correlatedCert)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            {t("viewCertificate")}
                          </button>
                        ) : (
                          <span className="text-slate-600 font-sans">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Overlay Pop up Modal for viewing certificate details */}
      {activeCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl relative animate-scale-up">
            <CertificateBuilder 
              certificate={activeCert}
              onClose={() => setActiveCert(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
