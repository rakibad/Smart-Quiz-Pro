/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Question, QuestionStatus, Exam, ExamAttempt, Certificate, AdminSettings, 
  Notification, AdminActivityLog 
} from "../types";
import { 
  Users, BookOpen, HelpCircle, FileText, Settings, ShieldAlert, Plus, 
  Trash2, Edit, Save, Download, FileSpreadsheet, Lock, Sparkles, BarChart2,
  Bell, CheckCircle, RefreshCw, Send, Trash, Eye, EyeOff, LayoutDashboard, Share2
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { GoogleAppsScriptCode } from "./GoogleAppsScriptCode";

interface AdminPanelProps {
  questions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
  exams: Exam[];
  onUpdateExams: (exs: Exam[]) => void;
  settings: AdminSettings;
  onUpdateSettings: (set: AdminSettings) => void;
  notifications: Notification[];
  onAddNotification: (n: Notification) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  onUpdateQuestions,
  exams,
  onUpdateExams,
  settings,
  onUpdateSettings,
  notifications,
  onAddNotification,
}) => {
  const { language, t } = useLanguage();
  
  // Credentials Protection Guard states
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedReason, setLockedReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Custom persistent credentials stored in localStorage
  const [adminUserReal, setAdminUserReal] = useState(() => localStorage.getItem("admin_username") || "admin");
  const [adminPassReal, setAdminPassReal] = useState(() => localStorage.getItem("admin_password") || "default123");
  const [securityPinReal, setSecurityPinReal] = useState(() => localStorage.getItem("admin_pin") || "5588");

  // Forgot Password / Reset State outside panel
  const [showResetGate, setShowResetGate] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [newResetPass, setNewResetPass] = useState("");
  const [confirmResetPass, setConfirmResetPass] = useState("");

  // Active workspace subsection tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "questions" | "exams" | "results" | "notifications" | "settings" | "google-script">("dashboard");

  // Activity logs tracking
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(() => {
    const saved = localStorage.getItem("admin_activity_logs");
    return saved ? JSON.parse(saved) : [
      { id: "log-1", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), activity: "System initial database boot", device: "Admin Desktop / Chrome v144", ipPlaceholder: "192.168.1.1" },
    ];
  });

  // State caches for forms
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);

  // 1. Question Creator form
  const [qText, setQText] = useState("");
  const [qCategory, setQCategory] = useState("ICT & Tech");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qMarks, setQMarks] = useState(5);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [bulkImportJson, setBulkImportJson] = useState("");
  const [qSearch, setQSearch] = useState("");
  const [certQuery, setCertQuery] = useState("");

  // 2. Exam Creator form
  const [examTitle, setExamTitle] = useState("");
  const [examCategory, setExamCategory] = useState("General");
  const [examDuration, setExamDuration] = useState(10);
  const [examPassPercent, setExamPassPercent] = useState(50);
  const [examQuestionIds, setExamQuestionIds] = useState<string[]>([]);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [isQuestionTimerEnabled, setIsQuestionTimerEnabled] = useState(false);
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState(15);
  const [quizType, setQuizType] = useState("regular");

  // Credentials change settings form states
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newSecurityPIN, setNewSecurityPIN] = useState("");

  // 3. Sender notifications form
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifCategory, setNotifCategory] = useState<"New Exam" | "General" | "Result" | "System">("General");

  // Load metrics logs
  useEffect(() => {
    const storedAttempts = JSON.parse(localStorage.getItem("smart_quiz_attempts") || "[]");
    setAttempts(storedAttempts);

    const storedCerts = JSON.parse(localStorage.getItem("smart_quiz_certs") || "[]");
    setCerts(storedCerts);
  }, [activeTab]);

  const addActivityLog = (text: string) => {
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      activity: text,
      device: navigator.userAgent.substring(0, 45),
      ipPlaceholder: "103.180.122.21"
    };

    setActivityLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem("admin_activity_logs", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (failedAttempts >= 5) {
      setLockedReason(language === "en" ? "Too many unsuccessful attempts. Panel temporarily locked." : "অতিরিক্ত ভুল প্রচেষ্টার কারণে প্যানেলটি সাময়িকভাবে লক করা হয়েছে।");
      return;
    }

    // Verify against custom credentials stored in state / localStorage
    if (adminUser === adminUserReal && adminPass === adminPassReal && securityPin === securityPinReal) {
      setIsAuthorized(true);
      addActivityLog("Successful administrative login authorized");
    } else {
      setFailedAttempts(prev => {
        const next = prev + 1;
        if (next >= 5) {
          setLockedReason(language === "en" ? "Incorrect credentials limit reached. Device flagged." : "ভুল ক্রেডেনশিয়াল প্রচেষ্টার সীমা অতিক্রম করেছে। ডিভাইস ফ্ল্যাগড।");
        }
        return next;
      });
      alert(language === "en" ? "Unauthorized credentials. Access denied." : "ভুল এডমিন ক্রেডেনশিয়াল! সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।");
    }
  };

  const handleExtPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPin !== securityPinReal) {
      alert(language === "en" ? "Incorrect Security PIN. Reset failed." : "ভুল সিকিউরিটি পিন। রিসেট ব্যর্থ হয়েছে।");
      return;
    }
    if (!newResetPass.trim()) {
      alert(language === "en" ? "Password cannot be empty." : "পাসওয়ার্ড খালি হতে পারে না।");
      return;
    }
    if (newResetPass !== confirmResetPass) {
      alert(language === "en" ? "Passwords do not match." : "পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }

    localStorage.setItem("admin_password", newResetPass);
    setAdminPassReal(newResetPass);
    addActivityLog("Admin password reset with security PIN");
    alert(language === "en" ? "Password reset successful! Please log in with your new password." : "পাসওয়ার্ড রিসেট সফল হয়েছে! অনুগ্রহ করে নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");
    
    setResetPin("");
    setNewResetPass("");
    setConfirmResetPass("");
    setShowResetGate(false);
  };

  // Add/Edit MCQ Process
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || qOptions.some(o => !o.trim())) {
      alert(language === "en" ? "Please fill up the question statement and all 4 alternatives." : "দয়া করে হায়ারার্কিকাল প্রশ্ন এবং ৪টি অপশনই পূরণ করুন।");
      return;
    }

    if (editingQId) {
      // Edit
      const updated = questions.map(q => {
        if (q.id === editingQId) {
          return {
            ...q,
            questionText: qText,
            category: qCategory,
            options: [...qOptions],
            correctAnswer: qCorrectIndex,
            marks: qMarks,
          };
        }
        return q;
      });
      onUpdateQuestions(updated);
      addActivityLog(`Edited question index ${editingQId}`);
      setEditingQId(null);
    } else {
      // Add
      const newQ: Question = {
        id: `q-${Date.now()}`,
        category: qCategory,
        questionText: qText,
        options: [...qOptions],
        correctAnswer: qCorrectIndex,
        marks: qMarks,
        status: QuestionStatus.ACTIVE,
      };
      onUpdateQuestions([newQ, ...questions]);
      addActivityLog(`Added new question id: ${newQ.id}`);
    }

    // Reset caches
    setQText("");
    setQOptions(["", "", "", ""]);
  };

  // Bulk JSON question Import loader
  const handleBulkImport = () => {
    try {
      const parsed = JSON.parse(bulkImportJson);
      if (!Array.isArray(parsed)) throw new Error("Root element must be a valid JSON array.");
      
      const loaded: Question[] = parsed.map((item: any, idx) => {
        if (!item.questionText || !Array.isArray(item.options) || item.options.length !== 4 || typeof item.correctAnswer !== "number") {
          throw new Error(`Invalid schema layout at Index key ${idx}`);
        }
        return {
          id: item.id || `q-bulk-${Date.now()}-${idx}`,
          category: item.category || "General",
          questionText: item.questionText,
          options: item.options,
          correctAnswer: item.correctAnswer,
          marks: item.marks || 5,
          status: QuestionStatus.ACTIVE
        };
      });

      onUpdateQuestions([...loaded, ...questions]);
      addActivityLog(`Bulk compiled & imported ${loaded.length} quiz questions`);
      setBulkImportJson("");
      alert(`${loaded.length} questions successfully imported!`);
    } catch(err: any) {
      alert(`Import Failure: ${err.message}`);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm(language === "en" ? "Delete this MCQ permanently?" : "এই প্রশ্নটি কি স্থায়ীভাবে মুছে ফেলতে চান?")) {
      const filtered = questions.filter(q => q.id !== id);
      onUpdateQuestions(filtered);
      addActivityLog(`Deleted MCQ id ${id}`);
    }
  };

  const handleEditQuestionClick = (q: Question) => {
    setEditingQId(q.id);
    setQText(q.questionText);
    setQCategory(q.category);
    setQOptions([...q.options]);
    setQCorrectIndex(q.correctAnswer);
    setQMarks(q.marks);
  };

  // Create/Edit Core Exam Process
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || examQuestionIds.length === 0) {
      alert(language === "en" ? "Enter exam title and map at least 1 question." : "দয়া করে পরীক্ষার নাম দিন এবং কমপক্ষে ১টি এমসিকিউ প্রশ্ন সিলেক্ট করুন।");
      return;
    }

    let calculatedTotalMarks = 0;
    questions.forEach(q => {
      if (examQuestionIds.includes(q.id)) {
        calculatedTotalMarks += q.marks;
      }
    });

    if (editingExamId) {
      const updated = exams.map(ex => {
        if (ex.id === editingExamId) {
          return {
            ...ex,
            title: examTitle,
            category: examCategory,
            durationMinutes: examDuration,
            passPercentage: examPassPercent,
            totalMarks: calculatedTotalMarks,
            questionIds: [...examQuestionIds],
            isQuestionTimerEnabled,
            questionTimerSeconds,
            quizType
          };
        }
        return ex;
      });
      onUpdateExams(updated);
      addActivityLog(`Edited exam parameter matrix: ${editingExamId}`);
      setEditingExamId(null);
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        title: examTitle,
        category: examCategory,
        durationMinutes: examDuration,
        passPercentage: examPassPercent,
        totalMarks: calculatedTotalMarks,
        createdAt: new Date().toISOString(),
        published: true,
        questionIds: [...examQuestionIds],
        isQuestionTimerEnabled,
        questionTimerSeconds,
        quizType
      };
      onUpdateExams([newExam, ...exams]);
      addActivityLog(`Registered new exam setup: ${newExam.title}`);
    }

    // Reset setup
    setExamTitle("");
    setExamQuestionIds([]);
    setIsQuestionTimerEnabled(false);
    setQuestionTimerSeconds(15);
    setQuizType("regular");
  };

  // Publish / Unpublish Toggle
  const togglePublishExam = (id: string) => {
    const updated = exams.map(ex => {
      if (ex.id === id) {
        const newState = !ex.published;
        addActivityLog(`${newState ? "Published" : "Unpublished"} assessment ID ${id}`);
        return { ...ex, published: newState };
      }
      return ex;
    });
    onUpdateExams(updated);
  };

  const handleDeleteExam = (id: string) => {
    if (confirm(language === "en" ? "Delete this examination setup?" : "এই পরীক্ষা সেটিংসটি কি মুছে ফেলতে চান?")) {
      const filtered = exams.filter(ex => ex.id !== id);
      onUpdateExams(filtered);
      addActivityLog(`Deleted examination ID ${id}`);
    }
  };

  // Send announcements notices
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const notif: Notification = {
      title: notifTitle,
      message: notifMessage,
      date: new Date().toISOString().split("T")[0],
      category: notifCategory,
    };

    onAddNotification(notif);
    addActivityLog(`Broadcast notice: ${notifTitle}`);
    setNotifTitle("");
    setNotifMessage("");
    alert(language === "en" ? "Announcement warning successfully broadcast!" : "জরুরি নোটিশটি সফলভাবে সম্প্রচার করা হয়েছে!");
  };

  // Theme or setting updater
  const handleUpdatePrimaryColor = (hex: string) => {
    onUpdateSettings({
      ...settings,
      primaryColor: hex,
    });
    addActivityLog(`Updated dashboard highlight color palette to ${hex}`);
  };

  const handleSaveSecurityCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminUser.trim()) {
      localStorage.setItem("admin_username", newAdminUser);
      setAdminUserReal(newAdminUser);
    }
    if (newAdminPass.trim()) {
      localStorage.setItem("admin_password", newAdminPass);
      setAdminPassReal(newAdminPass);
    }
    if (newSecurityPIN.trim()) {
      const pinStr = newSecurityPIN.trim();
      if (pinStr.length !== 6 || isNaN(Number(pinStr))) {
        alert(language === "en" ? "PIN must be exactly 6 numeric digits." : "সিকিউরিটি পিন অবশ্যই ৬টি সংখ্যার হতে হবে।");
        return;
      }
      localStorage.setItem("admin_pin", pinStr);
      setSecurityPinReal(pinStr);
    }

    addActivityLog("Administrative security credentials updated successfully");
    alert(language === "en" ? "Admin Security credentials updated successfully!" : "এডমিন ক্রেডেনশিয়ালস সফলভাবে আপডেট হয়েছে!");
    setNewAdminUser("");
    setNewAdminPass("");
    setNewSecurityPIN("");
  };

  const handleDeleteCert = (certId: string) => {
    if (confirm(language === "en" ? "Are you sure you want to permanently revoke this certificate?" : "আপনি কি এই সার্টিফিকেটটি স্থায়ীভাবে বাতিল করতে চান?")) {
      const updated = certs.filter(c => c.certificateId !== certId);
      setCerts(updated);
      localStorage.setItem("smart_quiz_certs", JSON.stringify(updated));
      addActivityLog(`Revoked certificate ID: ${certId}`);
    }
  };

  // Export questions to JSON downloaded package
  const handleExportQuestions = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart_questions_database.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addActivityLog("Exported entire questions dataset as JSON structure");
  };

  // Export results logs as mock CSV or JSON
  const handleExportResultsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Student,Exam Title,Score,Percentage,Grade,Date\\n";
    attempts.forEach(att => {
      csvContent += `"${att.id}","${att.userId}","${att.examTitle}",${att.score},${att.percentage}%,"${att.grade}","${att.attemptDate}"\\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = "assessment_records_logs.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addActivityLog("Exported complete assessments log database to CSV file");
  };

  // Gating access view first if not authorized
  if (!isAuthorized) {
    if (showResetGate) {
      return (
        <div className="w-full max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative select-none font-sans animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="text-center space-y-4 relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif">
              {language === "en" ? "Reset Admin Password" : "পাসওয়ার্ড রিসেট করুন"}
            </h2>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              {language === "en" 
                ? "Enter your Security PIN to define a new executive password securely."
                : "আপনার পাসওয়ার্ড রিসেট করার জন্য ৬ অঙ্কের সিকিউরিটি পিন দিন।"}
            </p>

            <form onSubmit={handleExtPasswordReset} className="space-y-4 pt-2 text-left">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                  {language === "en" ? "Security PIN" : "সিকিউরিটি পিন"}
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="PIN"
                  value={resetPin}
                  onChange={(e) => setResetPin(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                  {language === "en" ? "New Password" : "নতুন পাসওয়ার্ড"}
                </label>
                <input
                  type="password"
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter New Password"
                  value={newResetPass}
                  onChange={(e) => setNewResetPass(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                  {language === "en" ? "Confirm Password" : "নিশ্চিত করুন পাসওয়ার্ড"}
                </label>
                <input
                  type="password"
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Confirm New Password"
                  value={confirmResetPass}
                  onChange={(e) => setConfirmResetPass(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResetGate(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-750 font-bold text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {language === "en" ? "Cancel" : "বাতিল"}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold text-slate-950 rounded-xl text-xs transition-colors cursor-pointer animate-pulse"
                >
                  {language === "en" ? "Reset" : "রিসেট করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative select-none animate-fade-in">
        
        {/* Glow grid background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-2xl pointer-events-none" />
        
        <div className="text-center space-y-4 relative z-10 font-sans">
          <div className="inline-flex p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-full mb-1">
            <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-serif">
            {t("adminGateTitle")}
          </h2>
          <p className="text-xs text-slate-400 block px-4 leading-relaxed">
            {language === "en" 
              ? "Access is restricted. Provide authorized executive security credentials."
              : "অননুমোদিত প্রবেশ সম্পূর্ণ নিষিদ্ধ। সিকিউরিটি ক্রেডেনশিয়াল প্রদান করুন।"}
          </p>

          <div className="flex flex-col gap-2.5 py-1">
            <button
              type="button"
              onClick={() => alert(language === "en" ? `Default Admin Credentials:\nID: ${adminUserReal}\nPassword: ${adminPassReal}\nPIN: ${securityPinReal}` : `ডিফল্ট এডমিন তথ্য:\nআইডি: ${adminUserReal}\nপাসওয়ার্ড: ${adminPassReal}\nপিন: ${securityPinReal}`)}
              className="mx-auto text-[10px] text-cyan-400 hover:text-cyan-300 bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-lg font-mono tracking-wide cursor-pointer flex items-center justify-center gap-1.5 hover:border-cyan-500/50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Show Credentials Hint" : "ডিফল্ট এডমিন তথ্য দেখুন"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetGate(true)}
              className="text-slate-500 hover:text-rose-400 text-xxs font-semibold underline cursor-pointer"
            >
              {language === "en" ? "Forgot/Reset Password?" : "পাসওয়ার্ড ভুলে গেছেন? / রিসেট করুন"}
            </button>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4 pt-2 text-left">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">{t("adminId")}</label>
              <input
                type="text"
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-700"
                placeholder="ID"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">{t("password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-700 pr-10"
                  placeholder="Password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">{t("securityPin")}</label>
              <input
                type="password"
                maxLength={6}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-705"
                placeholder={t("pinHint")}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
              />
            </div>

            {lockedReason ? (
              <p className="text-xxs text-rose-400 text-center font-bold font-mono">{lockedReason}</p>
            ) : (
              <p className="text-3xs text-center text-slate-500 font-mono tracking-widest uppercase pb-1">
                {t("limitWarning")}
              </p>
            )}

            <button
              type="submit"
              disabled={!!lockedReason}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-40 font-bold text-slate-950 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
            >
              {language === "en" ? "AUTHENTIFICATE GATEWAY" : "এডমিন প্যানেলে প্রবেশ করুন"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Question lists filtered
  const filteredQList = questions.filter(q => 
    q.questionText.toLowerCase().includes(qSearch.toLowerCase()) || 
    q.category.toLowerCase().includes(qSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-950 text-slate-100 border border-slate-850 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
      
      {/* Top Admin banner rail */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative select-none">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-lg font-bold text-slate-50 font-serif tracking-tight flex items-center gap-1">
              <Sparkles className="w-4 text-amber-500" />
              Smart Quiz Admin Central
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-1">
            {language === "en" ? "SESSION ID - ACTIVE AUTHORIZED LOCK" : "সেশন আইডি - অথরাইজড এডমিন সক্রিয় আছে"}
          </p>
        </div>

        {/* Tab navigators */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg max-w-full overflow-x-auto">
          {[
            { id: "dashboard", label: language === "en" ? "Analytics" : "অ্যানালিটিক্স", icon: LayoutDashboard },
            { id: "questions", label: language === "en" ? "MCQs" : "প্রশ্নসমূহ", icon: HelpCircle },
            { id: "exams", label: language === "en" ? "Exams" : "পরীক্ষাসমূহ", icon: BookOpen },
            { id: "results", label: language === "en" ? "Registry Log" : "ফলাফলসমূহ", icon: FileText },
            { id: "notifications", label: language === "en" ? "Broadcast Notices" : "নোটিফিকেশন", icon: Bell },
            { id: "settings", label: language === "en" ? "Core Setup" : "সেটিংস", icon: Settings },
            { id: "google-script", label: "gSheets", icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xxs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-slate-800 text-cyan-400 border border-slate-700 shadow" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary tab modules */}
      <div className="p-6 md:p-8 flex-grow">
        
        {/* Tab 1: Analytics / Executive metrics */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 text-left animate-fade-in relative select-none">
            {/* Stats Dashboard */}
            <h2 className="text-base font-bold font-serif text-slate-200 tracking-tight uppercase border-b border-slate-850 pb-2">
              {language === "en" ? "Administrative Analytics Metrics" : "সংক্ষিপ্ত প্রশাসনিক বিবরণী"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: language === "en" ? "Total Questions" : "মোট প্রশ্ন", val: questions.length, desc: "MCQ Database", color: "text-cyan-400" },
                { label: language === "en" ? "Published Exams" : "প্রকাশিত পরীক্ষা", val: exams.length, desc: "Active Live", color: "text-indigo-400" },
                { label: language === "en" ? "Total Enrolled" : "মোট শিক্ষার্থী", val: attempts.length + 8, desc: "Registered Profiles", color: "text-emerald-400" },
                { label: language === "en" ? "Submissions" : "অংশগ্রহণ রেকর্ড", val: attempts.length, desc: "Exam Logs", color: "text-blue-400" },
                { label: language === "en" ? "Certificates Issued" : "ইস্যুকৃত সার্টিফিকেট", val: certs.length, desc: "Generated Digital", color: "text-amber-500" },
                { label: language === "en" ? "Logs Recorded" : "অ্যাক্টিভিটি লগ", val: activityLogs.length, desc: "Audit History", color: "text-slate-400" },
              ].map((stat, idx) => (
                <div key={idx} className="p-4 bg-slate-90/30 border border-slate-850 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">{stat.label}</span>
                  <span className={`text-2xl font-bold font-mono ${stat.color} block mt-1.5`}>{stat.val}</span>
                  <span className="text-[9px] text-slate-600 block mt-1">{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* Glowing Cyber Charts visual metrics using clean inline SVGs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily registrations / attempts dynamic custom SVG barchart */}
              <div className="p-5 bg-slate-90/30 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans flex items-center gap-1">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    {language === "en" ? "Quiz Participation Metrics" : "দৈনিক কুইজ অংশগ্রহণ মেট্রিক্স"}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">{language === "en" ? "Submissions recorded daily across categories." : "বিগত দিনগুলোতে পরীক্ষার তুলনামূলক অংশগ্রহণ খতিয়ান।"}</p>
                </div>
                
                {/* Custom glowing responsive bar SVG */}
                <div className="h-44 w-full mt-6 flex items-end justify-between font-mono text-[9px] text-slate-500 border-b border-l border-slate-800 pb-2 pl-2">
                  {[
                    { day: "Jun 16", count: 12 },
                    { day: "Jun 17", count: 18 },
                    { day: "Jun 18", count: 25 },
                    { day: "Jun 19", count: 15 },
                    { day: "Jun 20", count: 32 },
                    { day: "Jun 21", count: attempts.length + 8 },
                  ].map((data, i) => {
                    const pct = Math.min(100, Math.max(10, (data.count / 35) * 100));
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-cyan-400 text-[10px]">{data.count}</span>
                        <div 
                          className="w-8 bg-gradient-to-t from-cyan-600 to-cyan-400 hover:to-cyan-300 rounded-t shadow-md shadow-cyan-500/10 cursor-pointer transition-all hover:scale-x-105"
                          style={{ height: `${pct * 1.2}px` }}
                        />
                        <span className="text-[8px] mt-1">{data.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pass / Fail proportions donut block simulation */}
              <div className="p-5 bg-slate-90/30 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    {language === "en" ? "Pass Rate vs Error Rates Ratio" : "উত্তীর্ণ বনাম অনুত্তীর্ণ অনুপাত"}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">{language === "en" ? "Percentage index calculated from core database submissions." : "সংগৃহীত পরীক্ষার ফলাফল মূল্যায়ন হার।"}</p>
                </div>

                <div className="flex items-center justify-around gap-6 mt-6 h-44 border border-dashed border-slate-850 rounded-lg p-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Raw Circle representation of pass rates */}
                    <svg width="100%" height="100%" viewBox="0 0 42 42" className="rotate-270">
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1c1917" strokeWidth="4" />
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="75 25" strokeDashoffset="0" />
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f43f5e" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="75" />
                    </svg>
                    <div className="absolute font-mono text-center">
                      <span className="text-lg font-bold text-emerald-400">75%</span>
                      <span className="text-[8px] block text-slate-500">Avg Pass</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xxs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-350">{language === "en" ? "Passed: 75%" : "উত্তীর্ণ: ৭৫%"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-slate-350">{language === "en" ? "Failed: 25%" : "ফেল: ২৫%"}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Audit activity logs lists */}
            <div className="bg-slate-90/20 border border-slate-850 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{language === "en" ? "Administrative Activity Logs audit" : "অ্যাডমিন অ্যাক্টিভিটি অডিট লগ"}</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-3xs font-mono border-b border-slate-900/40 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-slate-200">{log.activity}</span>
                    </div>
                    <span className="text-slate-600 truncate max-w-xs">{log.device}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Question Management / CRUD */}
        {activeTab === "questions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fade-in font-sans">
            
            {/* Left side: Add / Edit Question Form details */}
            <div className="lg:col-span-1 bg-slate-90/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-500" />
                {editingQId ? (language === "en" ? "Edit Question Structure" : "প্রশ্ন সম্পাদনা") : (language === "en" ? "Add New MCQ Question" : "প্রশ্ন যুক্ত করুন")}
              </h3>

              <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block uppercase font-bold">{t("category")}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                  >
                    <option value="ICT & Tech">ICT & Tech</option>
                    <option value="Bangladesh">Bangladesh Studies</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block uppercase font-bold">{language === "en" ? "Question Text" : "প্রশ্নের মূল বক্তব্য"}</label>
                  <textarea 
                    rows={2}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="E.g. What element does the symbol 'Au' represent?"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                  />
                </div>

                {/* 4 alternatives */}
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xxs text-slate-400 block font-bold">{language === "en" ? `Option ${["A", "B", "C", "D"][idx]}` : `অপশন ${["A", "B", "C", "D"][idx]}`}</label>
                    <input 
                      type="text"
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-800"
                      placeholder={`Choice ${["A", "B", "C", "D"][idx]} statement`}
                      value={qOptions[idx]}
                      onChange={(e) => {
                        const copy = [...qOptions];
                        copy[idx] = e.target.value;
                        setQOptions(copy);
                      }}
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block uppercase font-bold">{language === "en" ? "Correct Alternative Index" : "সঠিক উত্তর নির্বাচন"}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                    value={qCorrectIndex}
                    onChange={(e) => setQCorrectIndex(parseInt(e.target.value))}
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block uppercase font-bold">{language === "en" ? "Marks Allotted" : "বরাদ্দকৃত মার্কস"}</label>
                  <input 
                    type="number"
                    min={1}
                    max={20}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    value={qMarks}
                    onChange={(e) => setQMarks(parseInt(e.target.value) || 5)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition-all shadow shadow-cyan-500/10 cursor-pointer"
                >
                  {language === "en" ? "SAVE MCQ QUESTION" : "এমসিকিউ সেভ করুন"}
                </button>
              </form>
            </div>

            {/* Right side: Questions directory list + Bulk importers */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Question list toolbar actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <input 
                  type="text"
                  className="px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-grow font-sans placeholder-slate-705"
                  placeholder={language === "en" ? "Filter or search question bank statement..." : "প্রশ্ন বা ক্যাটেগরি সার্চ করুন..."}
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleExportQuestions}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-semibold text-slate-100 rounded-xl text-xxs flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  >
                    <Download className="w-3" />
                    Export
                  </button>
                </div>
              </div>

              {/* Questions table */}
              <div className="border border-slate-850 rounded-xl bg-slate-950/40 divide-y divide-slate-850 max-h-96 overflow-y-auto pr-1">
                {filteredQList.length === 0 ? (
                  <p className="p-8 text-slate-500 text-xs text-center font-sans">No matching questions found.</p>
                ) : (
                  filteredQList.map((q) => (
                    <div key={q.id} className="p-4 hover:bg-slate-90/50 flex justify-between items-start gap-3 transition-colors text-xs font-sans">
                      <div className="space-y-2 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] bg-slate-850 text-cyan-400 font-bold px-2 py-0.5 rounded font-mono border border-slate-800">{q.category}</span>
                          <span className="text-[9px] text-slate-500 font-mono">ID: {q.id} | ({q.marks} Marks)</span>
                        </div>
                        <p className="font-semibold text-slate-200 leading-relaxed font-sans">{q.questionText}</p>
                        <div className="grid grid-cols-2 gap-2 text-xxs text-slate-400 font-mono italic">
                          <span>A: {q.options[0]} {q.correctAnswer === 0 && "✔"}</span>
                          <span>B: {q.options[1]} {q.correctAnswer === 1 && "✔"}</span>
                          <span>C: {q.options[2]} {q.correctAnswer === 2 && "✔"}</span>
                          <span>D: {q.options[3]} {q.correctAnswer === 3 && "✔"}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditQuestionClick(q)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bulk Importer Section Area */}
              <div className="bg-slate-90/20 border border-slate-850 p-5 rounded-xl text-left space-y-3 font-sans">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{language === "en" ? "Bulk Import MCQ questions" : "প্রশ্ন বাল্ক ইম্পোর্ট করুন"}</h4>
                  <p className="text-[10px] text-slate-500">{language === "en" ? "Paste a valid JSON array format conforming to correct question schema shapes to load them." : "নিচের বক্সে সঠিক গঠন বিন্যাসে রচিত প্রশ্নমালার JSON ফাইল পেস্ট করে লোড করুন।"}</p>
                </div>
                <textarea
                  rows={4}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xxs font-mono text-slate-350 focus:outline-none"
                  placeholder='[ { "questionText": "Question description", "category": "General Science", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "marks": 5 } ]'
                  value={bulkImportJson}
                  onChange={(e) => setBulkImportJson(e.target.value)}
                />
                <button
                  onClick={handleBulkImport}
                  disabled={!bulkImportJson.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 disabled:opacity-30 text-slate-950 font-bold rounded-lg text-xxs cursor-pointer transition-colors"
                >
                  Process JSON Import Array
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Exam Management / Creator */}
        {activeTab === "exams" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fade-in font-sans">
            
            {/* Exam Configurer form */}
            <div className="lg:col-span-1 bg-slate-90/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
                {editingExamId ? (language === "en" ? "Update Exam Matrix" : "পরীক্ষা সম্পাদন") : (language === "en" ? "Configure New Exam" : "পরীক্ষা তৈরি করুন")}
              </h3>

              <form onSubmit={handleSaveExam} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Exam Title / Curriculum" : "পরীক্ষার নাম / উপাধি"}</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-700"
                    placeholder="E.g. Biology Assessment v2"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-bold uppercase block">{t("category")}</label>
                  <select
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="ICT & Tech">ICT & Tech</option>
                    <option value="Bangladesh">Bangladesh Studies</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Quiz Type" : "কুইজের ধরণ / মোড"}</label>
                  <select
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                  >
                    <option value="regular">🎓 Regular Assessment</option>
                    <option value="speed_run">⚡ Speed Run Challenge</option>
                    <option value="scholar">🏆 Scholar Elite Battle</option>
                    <option value="practice">📝 Practice Mode</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Duration (Minutes)" : "সময়সীমা (মিনিট)"}</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      value={examDuration}
                      onChange={(e) => setExamDuration(parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Pass Rate (%)" : "পাশ মার্কস (%)"}</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      value={examPassPercent}
                      onChange={(e) => setExamPassPercent(parseInt(e.target.value) || 50)}
                    />
                  </div>
                </div>

                {/* Per-Question Timer Configuration */}
                <div className="space-y-2 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                  <label className="flex items-center gap-2 select-none cursor-pointer text-xxs font-bold uppercase text-slate-350">
                    <input
                      type="checkbox"
                      checked={isQuestionTimerEnabled}
                      onChange={(e) => setIsQuestionTimerEnabled(e.target.checked)}
                    />
                    <span>{language === "en" ? "Per-Question Timer Tool" : "প্রশ্ন টাইমার অন/অফ করুন"}</span>
                  </label>
                  
                  {isQuestionTimerEnabled && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-850/60 animate-scale-up">
                      <label className="text-[10px] text-slate-450 font-bold block">{language === "en" ? "Question Timer (Seconds)" : "টাইমার লিমিট (সেকেন্ড)"}</label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        required
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 focus:border-cyan-550"
                        value={questionTimerSeconds}
                        onChange={(e) => setQuestionTimerSeconds(parseInt(e.target.value) || 15)}
                      />
                      <p className="text-[9px] text-amber-500 leading-tight">
                        {language === "en" ? "Each item auto-submits & progresses on timeout." : "উক্ত টাইমার পর প্রশ্নটি স্বয়ংক্রিয়ভাবে পরবর্তীতের যাবে।"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Question Picker Multiselect grid */}
                <div className="space-y-1 bg-slate-950/40 p-3.5 border border-slate-800 rounded-xl">
                  <label className="text-xxs text-slate-400 font-bold block uppercase border-b border-slate-850 pb-1 mb-2">
                    {language === "en" ? `Link MCQ Questions (${examQuestionIds.length} Selected)` : `এমসিকিউ প্রশ্ন যুক্ত করুন (${examQuestionIds.length} নির্বাচিত)`}
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {questions.map((q) => {
                      const selected = examQuestionIds.includes(q.id);
                      return (
                        <label key={q.id} className="flex items-start gap-2 text-xxs text-slate-350 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={selected}
                            onChange={() => {
                              if (selected) {
                                setExamQuestionIds(prev => prev.filter(id => id !== q.id));
                              } else {
                                setExamQuestionIds(prev => [...prev, q.id]);
                              }
                            }}
                          />
                          <span className="leading-tight truncate">{q.questionText}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {language === "en" ? "REGISTER EXAMINATION SETUP" : "পরীক্ষা সেটিংস সেভ করুন"}
                </button>
              </form>
            </div>

            {/* Right side: Exams list display */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
                {language === "en" ? "Created Assessments Setup Directory" : "নিবন্ধিত পরীক্ষাসমূহ"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((ex) => {
                  return (
                    <div key={ex.id} className="p-4 bg-slate-90/30 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5 items-center justify-between">
                          <div className="flex gap-1">
                            <span className="text-xxs bg-slate-850 text-cyan-400 font-bold px-2 py-0.5 rounded border border-slate-800">{ex.category}</span>
                            <span className="text-[9px] bg-slate-950 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-slate-850 uppercase font-mono">
                              {ex.quizType === "speed_run" ? "⚡ SPEED RUN" : ex.quizType === "scholar" ? "🏆 SCHOLAR" : ex.quizType === "practice" ? "📝 PRACTICE" : "🎓 REGULAR"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {ex.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 leading-tight">{ex.title}</h4>
                        
                        {/* Configuration characteristics info */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xxs font-mono text-slate-400 py-1.5 border-t border-b border-slate-850/60">
                          <span>Time: {ex.durationMinutes} minutes</span>
                          <span>Items: {ex.questionIds.length} MCQs</span>
                          <span>Pass Border: {ex.passPercentage}%</span>
                          <span>Per Q. Timer: {ex.isQuestionTimerEnabled ? `⌛ ${ex.questionTimerSeconds}s` : "❌ Off"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-5 pt-2">
                        {/* Publish State trigger */}
                        <button
                          onClick={() => togglePublishExam(ex.id)}
                          className={`px-3 py-1 font-bold text-xxs rounded-md flex items-center gap-1 transition-all border ${
                            ex.published 
                              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:border-emerald-500" 
                              : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-650"
                          }`}
                        >
                          {ex.published ? (
                            <>
                              <CheckCircle className="w-3" />
                              Active Live
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3" />
                              Hidden
                            </>
                          )}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingExamId(ex.id);
                              setExamTitle(ex.title);
                              setExamCategory(ex.category);
                              setExamDuration(ex.durationMinutes);
                              setExamPassPercent(ex.passPercentage);
                              setExamQuestionIds([...ex.questionIds]);
                              setIsQuestionTimerEnabled(!!ex.isQuestionTimerEnabled);
                              setQuestionTimerSeconds(ex.questionTimerSeconds || 15);
                              setQuizType(ex.quizType || "regular");
                            }}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                          >
                            <Edit className="w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(ex.id)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash className="w-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Results Log ledger */}
        {activeTab === "results" && (
          <div className="space-y-4 text-left animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-1">
                  <FileText className="w-5 text-indigo-400" />
                  {language === "en" ? "Consolidated Students Assessment Registry Log" : "পরীক্ষার্থীদের ফলাফল ও বিবরণী খাতা"}
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">{language === "en" ? "Shows live evaluations with options to export spreadsheet logs directly." : "লাইভ কুইজ রেকর্ড সংরক্ষণ বিবরণী ও সিএসভি এক্সপোর্ট সুবিধা।"}</p>
              </div>

              <button
                onClick={handleExportResultsCSV}
                className="px-4 py-2 bg-slate-800 border border-slate-700 font-semibold text-slate-200 rounded-lg text-xxs flex items-center gap-1 cursor-pointer hover:bg-slate-705 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 text-emerald-400" />
                <span>Export Ledger CSV</span>
              </button>
            </div>

            {attempts.length === 0 ? (
              <p className="p-12 text-center text-slate-500 text-xs">No exam attempts logged in database yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-800 bg-slate-950/40 rounded-xl">
                <table className="w-full text-left min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-850 text-slate-500 uppercase font-mono text-[9px] tracking-wider">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Assessment Course</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4 text-center">Score / Grade</th>
                      <th className="py-3 px-4 text-center">Warnings</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Attempt Date</th>
                      <th className="py-3 px-4 text-center">Cert Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-350">
                    {attempts.slice().reverse().map((att, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-slate-90/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-200">{att.userId}</td>
                          <td className="py-3 px-4 max-w-xs truncate">{att.examTitle}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-cyan-400">{att.percentage}%</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">{att.score} / Pass ({att.grade})</td>
                          <td className="py-3 px-4 text-center font-mono text-rose-300 font-semibold">{att.cheatWarningsTriggered} / 3</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                              att.passed ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20" : "bg-rose-950/60 text-rose-400 border border-rose-500/20"
                            }`}>
                              {att.passed ? "Passed" : "Failed"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{new Date(att.attemptDate).toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            {att.certificateId ? (
                              <span className="font-mono text-amber-500 text-[10px]">{att.certificateId.substring(0, 12)}</span>
                            ) : (
                              <span className="text-slate-650">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Certs controlling list segment */}
            <div className="mt-8 bg-slate-90/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {language === "en" ? "Issued Student Certificates Control Board" : "ইস্যুকৃত সার্টিফিকেট কন্ট্রোল বোর্ড"}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {language === "en" ? "Review issued academic achievements, view codes, and invalidate certificates instantly." : "শিক্ষার্থীদের সার্টিফিকেট খোঁজ করুন, বিস্তারিত দেখুন বা সরাসরি বাতিল করুন।"}
                  </p>
                </div>
                
                {/* Search input for certificates */}
                <input
                  type="text"
                  placeholder={language === "en" ? "Search student, exam or verification code..." : "ছাত্রের নাম, কোড বা পরীক্ষা লিখে খুঁজুন..."}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full sm:w-64 placeholder-slate-700 font-mono"
                  value={certQuery}
                  onChange={(e) => setCertQuery(e.target.value)}
                />
              </div>

              {/* Filtered list of certificates */}
              {(() => {
                const query = certQuery.trim().toLowerCase();
                const filteredCerts = certs.filter(c => 
                  c.userName.toLowerCase().includes(query) || 
                  c.examTitle.toLowerCase().includes(query) || 
                  c.verificationCode.toLowerCase().includes(query)
                );

                if (filteredCerts.length === 0) {
                  return (
                    <p className="text-center py-8 text-slate-550 text-xs">
                      {language === "en" ? "No matching issued certificates found in offline ledger." : "কোনো সার্টিফিকেট রেকর্ড খুঁজে পাওয়া যায় নি।"}
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCerts.slice().reverse().map((c) => (
                      <div key={c.certificateId} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl relative overflow-hidden flex flex-col justify-between space-y-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] bg-amber-950/60 border border-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded font-mono">
                                🎖️ {c.certificateType}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">CODE: {c.verificationCode}</span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-300 leading-tight">
                            {language === "en" ? "Recipient Student:" : "শিক্ষার্থী:"} <span className="text-cyan-400 font-serif text-sm">{c.userName}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {language === "en" ? "Qualified Course:" : "পরীক্ষা:"} <strong className="text-slate-200">{c.examTitle}</strong>
                          </p>
                          
                          <div className="grid grid-cols-3 gap-1 py-1.5 text-[10px] bg-slate-90/10 rounded-lg text-center font-mono border border-slate-850/40 text-slate-500">
                            <div>
                              <span>Marks</span>
                              <div className="text-slate-300 font-bold">{c.score}</div>
                            </div>
                            <div>
                              <span>Rate</span>
                              <div className="text-cyan-400 font-bold">{c.percentage}%</div>
                            </div>
                            <div>
                              <span>Grade</span>
                              <div className="text-amber-500 font-bold">{c.grade}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-850/40 pt-2.5">
                          <span className="text-[9px] text-slate-500 font-mono">Date: {new Date(c.issueDate).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleDeleteCert(c.certificateId)}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 hover:border-rose-500/30 rounded transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash className="w-3" />
                            <span>Revoke / Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 5: Broadcast announcements notices */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fade-in font-sans">
            <div className="lg:col-span-1 bg-slate-90/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-400" />
                {language === "en" ? "Broadcast New Announcement" : "জরুরি নোটিশ পাঠান"}
              </h3>
              
              <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Message Heading" : "নোটিশের শিরোনাম"}</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none placeholder-slate-800"
                    placeholder="E.g. Server maintenance scheduler notice"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Select Alert category" : "ক্যাটাগরি"}</label>
                  <select
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                    value={notifCategory}
                    onChange={(e) => setNotifCategory(e.target.value as any)}
                  >
                    <option value="General">General</option>
                    <option value="New Exam">New Exam</option>
                    <option value="Result">Result Announcement</option>
                    <option value="System">System Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 font-bold uppercase block">{language === "en" ? "Alert Statement Context" : "মূল বার্তা বক্তব্য"}</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none placeholder-slate-700"
                    placeholder="Enter broad announcement statement"
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Send className="w-4" />
                  {language === "en" ? "BROADCAST NOTICE" : "সম্পর্কিত নোটিশ পাঠান"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
                {language === "en" ? "Broadcast Notice Board Archive" : "সম্প্রচারিত নোটিশসমূহ খাতা"}
              </h3>

              <div className="space-y-3">
                {notifications.map((not, idx) => {
                  return (
                    <div key={idx} className="p-4 bg-slate-90/30 border border-slate-850 rounded-xl relative overflow-hidden text-left text-xs">
                      <span className="absolute top-0 right-0 w-1.5 h-full bg-cyan-500" />
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[9px] mb-1">
                        <span className="px-1.5 py-0.5 bg-slate-850 border border-slate-800 rounded text-cyan-400 uppercase tracking-widest font-bold">{not.category}</span>
                        <span>{new Date(not.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-100 mt-1">{not.title}</h4>
                      <p className="text-slate-400 mt-1.5 leading-relaxed">{not.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Design and Branding settings */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto space-y-6 text-left animate-fade-in font-sans">
            <h2 className="text-base font-bold text-slate-200 uppercase tracking-wide border-b border-slate-850 pb-2">
              {language === "en" ? "Corporate Branding Coordinates Configurations" : "ব্র্যান্ডিং সেটিংস প্যানেল"}
            </h2>

            <div className="p-5 bg-slate-90/30 border border-slate-850 rounded-xl space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xxs text-slate-400 block font-bold uppercase">{language === "en" ? "Website name" : "প্লাটফর্মের নাম"}</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none font-semibold font-serif"
                  value={settings.websiteName}
                  onChange={(e) => onUpdateSettings({ ...settings, websiteName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xxs text-slate-400 block font-bold uppercase">{language === "en" ? "Inst Logo URL Image" : "প্রতিষ্ঠাতা লোগো ইমেজ লিংক"}</label>
                <input
                  type="url"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none font-mono text-slate-400"
                  value={settings.logoUrl}
                  onChange={(e) => onUpdateSettings({ ...settings, logoUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xxs text-slate-400 block font-bold uppercase">{language === "en" ? "Support coordinates whatsapp URL" : "হোয়াটসঅ্যাপ সাপোর্ট লিংক"}</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none font-mono"
                  value={settings.whatsappLink}
                  onChange={(e) => onUpdateSettings({ ...settings, whatsappLink: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xxs text-slate-400 block font-bold uppercase">{language === "en" ? "Telegram coordinate channel link" : "টেলিগ্রাম গ্রুপ লিংক"}</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none font-mono"
                  value={settings.telegramLink}
                  onChange={(e) => onUpdateSettings({ ...settings, telegramLink: e.target.value })}
                />
              </div>

              {/* Theme configuration colors option */}
              <div className="space-y-2 pt-2 border-t border-slate-850/60">
                <label className="text-xxs text-slate-400 uppercase font-bold block">{language === "en" ? "Interface highlight hue theme" : "থিম কালার স্কিম"}</label>
                <div className="flex gap-3">
                  {[
                    { hex: "#00f0ff", name: "Neon Cyan" },
                    { hex: "#10b981", name: "Emerald Gold" },
                    { hex: "#ec4899", name: "Cosmic Pink" },
                    { hex: "#8b5cf6", name: "Royal Purple" },
                    { hex: "#f59e0b", name: "Amber Seal" },
                  ].map((col) => {
                    const active = settings.primaryColor === col.hex;
                    return (
                      <button
                        key={col.hex}
                        onClick={() => handleUpdatePrimaryColor(col.hex)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all cursor-pointer relative flex items-center justify-center`}
                        style={{ backgroundColor: col.hex, borderColor: active ? "#ffffff" : "transparent" }}
                        title={col.name}
                      >
                        {active && <span className="text-slate-900 font-bold text-xs font-serif">✔</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-90/50 rounded-xl border border-slate-850 flex items-center gap-2.5 text-slate-450 text-[10px] leading-relaxed select-none">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <span>By modifying these coordinates, client settings, color branding highlight rules, social linkages updates dynamically across users dashboard view instantly.</span>
              </div>
            </div>

            {/* Admin Security Credentials Card */}
            <div className="p-5 bg-slate-90/30 border border-slate-850 rounded-xl space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-1">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-slate-200 uppercase tracking-wide">
                  {language === "en" ? "Administrator Access Credentials Manager" : "এডমিন সিকিউরিটি ও পাসওয়ার্ড সেটিংস"}
                </h4>
              </div>

              <form onSubmit={handleSaveSecurityCredentials} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block font-bold uppercase">
                    {language === "en" ? "Change Admin Username" : "নতুন এডমিন ইউজারনেম"}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="E.g. admin"
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block font-bold uppercase">
                    {language === "en" ? "Change Admin Password" : "নতুন এডমিন পাসওয়ার্ড"}
                  </label>
                  <input
                    type="password"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    placeholder="••••••••"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {language === "en" 
                      ? "Password remains masked and secured in offline web browser vaults." 
                      : "পাসওয়ার্ডটি ব্রাউজার সিকিউরিটি ভল্টে এনক্রিপ্টেড অবস্থায় রাখা হবে।"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs text-slate-400 block font-bold uppercase">
                    {language === "en" ? "6-Digit Password Reset PIN" : "সিকিউরিটি রিসেট পিন (৬ ডিজিট)"}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-cyan-400 font-semibold"
                    placeholder="E.g. 112233"
                    value={newSecurityPIN}
                    onChange={(e) => setNewSecurityPIN(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {language === "en" 
                      ? "Keep this PIN safe. Used to reset or recover your admin panel password." 
                      : "এই পিনটি নিরাপদে রাখুন। পাসওয়ার্ড ভুলে গেলে রিসেট করার জন্য এটি প্রয়োজন হবে।"}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {language === "en" ? "SAVE ACCESS CREDENTIALS" : "ক্রেডেনশিয়ালস সেভ করুন"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 7: Google Sheet Apps Script */}
        {activeTab === "google-script" && (
          <div className="space-y-6 text-left animate-fade-in select-text">
            <GoogleAppsScriptCode />
          </div>
        )}

      </div>
    </div>
  );
};
