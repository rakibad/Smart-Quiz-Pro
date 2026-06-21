/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Exam, Question, ExamAttempt, Certificate, CertificateType } from "../types";
import { 
  Clock, AlertTriangle, ChevronLeft, ChevronRight, Grid, Save, 
  Maximize2, Minimize2, ShieldAlert, Award, AlertOctagon, Power
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface ExamEngineProps {
  exam: Exam;
  questions: Question[];
  userId: string;
  userName: string;
  studentId: string;
  onFinished: (attempt: ExamAttempt, certificate?: Certificate) => void;
  onExit: () => void;
}

interface RuntimeQuestion {
  question: Question;
  shuffledOptions: string[];
  originalOptionIndices: number[]; // maps shuffled options to original Index [3, 0, 1, 2]
}

export const ExamEngine: React.FC<ExamEngineProps> = ({
  exam,
  questions,
  userId,
  userName,
  studentId,
  onFinished,
  onExit,
}) => {
  const { language, t } = useLanguage();
  const [runtimeQuestions, setRuntimeQuestions] = useState<RuntimeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({}); // qId: selectedRuntimeOptionIdx
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [warnings, setWarnings] = useState(0);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"synchronized" | "saving">("synchronized");
  const [qTimeLeft, setQTimeLeft] = useState(exam.questionTimerSeconds || 15);

  // Reset question countdown when currentIdx changes
  useEffect(() => {
    if (exam.isQuestionTimerEnabled) {
      setQTimeLeft(exam.questionTimerSeconds || 15);
    }
  }, [currentIdx, exam]);

  // Handle question timer countdown
  useEffect(() => {
    if (!exam.isQuestionTimerEnabled) return;
    if (qTimeLeft <= 0) {
      // Auto move to next or auto submit
      if (currentIdx < runtimeQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        handleForceSubmit("manual");
      }
      return;
    }

    const interval = setInterval(() => {
      setQTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [qTimeLeft, exam, currentIdx, runtimeQuestions.length]);

  // Track if completed to prevent double warnings or double submissions
  const isFinishedRef = useRef(false);
  const examContainerRef = useRef<HTMLDivElement>(null);

  // Initialize and shuffle questions & options upon start
  useEffect(() => {
    // 1. Shuffling: Grab questions belonging to this exam
    let examQs = questions.filter(q => exam.questionIds.includes(q.id));
    
    // Shuffling questions
    examQs = [...examQs].sort(() => Math.random() - 0.5);

    // 2. Map and Shuffling options for each question
    const prepped: RuntimeQuestion[] = examQs.map(q => {
      const idxs = [0, 1, 2, 3];
      // Shuffling options
      const shuffledIdxs = [...idxs].sort(() => Math.random() - 0.5);
      const shuffledOpts = shuffledIdxs.map(i => q.options[i]);

      return {
        question: q,
        shuffledOptions: shuffledOpts,
        originalOptionIndices: shuffledIdxs,
      };
    });

    setRuntimeQuestions(prepped);
    isFinishedRef.current = false;
  }, [exam, questions]);

  // Request/Toggle Fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await examContainerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle error: ", err);
    }
  };

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      
      // If student exiting fullscreen, trigger warning
      if (!isFinishedRef.current && !active && runtimeQuestions.length > 0) {
        triggerCheatWarning(
          language === "en" 
            ? "Exiting full screen mode is restricted! Please stay in fullscreen." 
            : "ফুল স্ক্রীন মোড ত্যাগ করা সম্পূর্ণ নিষিদ্ধ! দয়া করে ফুলস্ক্রিনে থাকুন।"
        );
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [runtimeQuestions, language]);

  // Anti-cheat Listeners (Copy, Paste, Right-Click, Visibility, Window Blur)
  useEffect(() => {
    const blockActions = (e: Event) => {
      e.preventDefault();
      triggerCheatWarning(
        language === "en"
          ? "Copying/Pasting or right-clicking is disabled during exams."
          : "পরীক্ষা চলাকালীন কপি, পেস্ট অথবা মাউসের ডান ক্লিক করা সম্পূর্ণ কপিরাইট করা নিষিদ্ধ।"
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isFinishedRef.current) {
        triggerCheatWarning(
          language === "en"
            ? "Tab switching detected! Keep focus on the exam screen."
            : "ট্যাব পরিবর্তন সনাক্ত হয়েছে! পরীক্ষা স্ক্রীন ছাড়া অন্য ট্যাব ওপেন করা যাবে না।"
        );
      }
    };

    const handleBlur = () => {
      if (!isFinishedRef.current) {
        triggerCheatWarning(
          language === "en"
            ? "Window focus lost! Back/background actions are recorded."
            : "উইন্ডো ফোকাস পরিবর্তন সনাক্ত হয়েছে! পরীক্ষা স্ক্রীনের বাইরে ক্লিক করবেন না।"
        );
      }
    };

    // Add listeners
    window.addEventListener("copy", blockActions);
    window.addEventListener("paste", blockActions);
    window.addEventListener("contextmenu", blockActions);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("copy", blockActions);
      window.removeEventListener("paste", blockActions);
      window.removeEventListener("contextmenu", blockActions);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [language]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleForceSubmit("time_out");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        // Auto-save emulation saving indicator every 15 seconds
        if (prev % 15 === 0) {
          setAutoSaveStatus("saving");
          setTimeout(() => setAutoSaveStatus("synchronized"), 800);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-Save Answers in Local State to prevent data loss on crash
  useEffect(() => {
    if (exam.id && Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_draft_${exam.id}_${userId}`, JSON.stringify(answers));
    }
  }, [answers, exam.id, userId]);

  // Load Saved Progress
  useEffect(() => {
    const saved = localStorage.getItem(`exam_draft_${exam.id}_${userId}`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [exam.id, userId]);

  // Trigger Cheat Warning
  const triggerCheatWarning = (msg: string) => {
    if (isFinishedRef.current) return;

    setWarnings(prev => {
      const nextWarnings = prev + 1;
      
      // Display warning modal alert
      setWarningMessage(msg);
      setShowWarningAlert(true);
      setTimeout(() => setShowWarningAlert(false), 5000);

      // Auto Submit after 3 warnings
      if (nextWarnings >= 3) {
        setTimeout(() => {
          handleForceSubmit("cheat_limit_reached");
        }, 1200);
      }
      return nextWarnings;
    });
  };

  // Force Submit Exam
  const handleForceSubmit = (reason: "time_out" | "cheat_limit_reached" | "manual") => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Remove any fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }

    // Evaluate Quiz answers
    let finalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    runtimeQuestions.forEach(rq => {
      const selectedShuffledIndex = answers[rq.question.id];
      if (selectedShuffledIndex !== undefined) {
        // convert selected index to original index
        const originalIndex = rq.originalOptionIndices[selectedShuffledIndex];
        if (originalIndex === rq.question.correctAnswer) {
          finalScore += rq.question.marks;
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        incorrectCount++; // Unanswered is wrong
      }
    });

    const percent = Math.round((finalScore / exam.totalMarks) * 100);
    const passed = percent >= exam.passPercentage;

    let finalGrade = "F";
    if (percent >= 90) finalGrade = "A+";
    else if (percent >= 80) finalGrade = "A";
    else if (percent >= 70) finalGrade = "B+";
    else if (percent >= 60) finalGrade = "B";
    else if (percent >= 50) finalGrade = "C";
    else if (percent >= 40) finalGrade = "D";

    // Create unique verification Code and Certificate ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateId = `CERT-${studentId.replace(/[^a-zA-Z0-9]/g, "")}-${randomSuffix}`;
    const verificationCode = `V-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${randomSuffix}`;

    // Prepare attempt object
    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      userId,
      score: finalScore,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      percentage: percent,
      grade: finalGrade,
      passed,
      attemptDate: new Date().toISOString(),
      tabSwitchesCount: warnings,
      cheatWarningsTriggered: warnings,
      certificateId: passed ? certificateId : undefined,
    };

    // Prepare certificate if student passed
    let cert: Certificate | undefined = undefined;
    if (passed) {
      let type = CertificateType.COMPLETION;
      if (percent >= 85) type = CertificateType.ACHIEVEMENT;
      else if (percent >= exam.passPercentage) type = CertificateType.PARTICIPATION;

      cert = {
        certificateId,
        userId,
        userName,
        studentId,
        examId: exam.id,
        examTitle: exam.title,
        score: finalScore,
        percentage: percent,
        grade: finalGrade,
        issueDate: new Date().toISOString(),
        verificationCode,
        certificateType: type,
      };

      // Store certificate in local database
      const existingCerts = JSON.parse(localStorage.getItem("smart_quiz_certs") || "[]");
      existingCerts.push(cert);
      localStorage.setItem("smart_quiz_certs", JSON.stringify(existingCerts));
    }

    // Save attempt in local collection
    const existingAttempts = JSON.parse(localStorage.getItem("smart_quiz_attempts") || "[]");
    existingAttempts.push(attempt);
    localStorage.setItem("smart_quiz_attempts", JSON.stringify(existingAttempts));

    // Cleanup draft answer
    localStorage.removeItem(`exam_draft_${exam.id}_${userId}`);

    // Call finished trigger
    onFinished(attempt, cert);
  };

  const currentRQ = runtimeQuestions[currentIdx];

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (runtimeQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 min-h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div 
      ref={examContainerRef}
      className="w-full max-w-5xl mx-auto bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden p-6 md:p-8 select-none"
    >
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,6,23,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,0.3)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Warning Overlay toast */}
      {showWarningAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 bg-rose-950 border-2 border-rose-500 rounded-xl flex items-center gap-3 animate-bounce shadow-xl shadow-rose-950/50">
          <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0" />
          <div className="text-left font-sans">
            <h4 className="font-bold text-rose-200 uppercase tracking-wider text-xs">
              {language === "en" ? `SECURE WARNING (${warnings}/3)` : `নিরাপত্তা সতর্কতা (${warnings}/৩)`}
            </h4>
            <p className="text-xs text-rose-300 mt-0.5">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800/80 z-10 relative">
        <div className="text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-500/30 rounded-full font-serif font-medium">
            {exam.category}
          </span>
          <h2 className="text-lg md:text-xl font-bold font-serif text-slate-100 mt-1">
            {exam.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Autosaver indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xxs font-mono">
            <Save className={`w-3.5 ${autoSaveStatus === "saving" ? "animate-spin text-cyan-400" : ""}`} />
            <span>{autoSaveStatus === "saving" ? "Saving..." : "AutoSaved"}</span>
          </div>

          {/* Time Countdown */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-semibold text-slate-100 transition-colors ${timeLeft < 60 ? "bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse" : "bg-slate-900 border-slate-800"}`}>
            <Clock className={`w-4 h-4 ${timeLeft < 60 ? "text-rose-400" : "text-cyan-400"}`} />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>

          {/* Warning Counter */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xxs font-bold ${warnings > 0 ? "bg-amber-950/60 border-amber-500/30 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === "en" ? `Warnings: ${warnings}/3` : `সতর্কতা: ${warnings}/৩`}</span>
          </div>

          {/* Screen mode Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg shrink-0 transition-all hover:scale-105"
            title="Toggle Secure Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main assessment interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6 z-10 relative">
        
        {/* Left side: Question display & alternatives */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Progress Tracker Slider bar */}
          <div className="w-full bg-slate-905 border border-slate-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / runtimeQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question specific countdown bar timer if enabled */}
          {exam.isQuestionTimerEnabled && (
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden -mt-3.5 border border-slate-900">
              <div 
                className={`h-1 transition-all duration-1000 ${qTimeLeft <= 5 ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
                style={{ width: `${(qTimeLeft / (exam.questionTimerSeconds || 15)) * 100}%` }}
              />
            </div>
          )}

          {/* Question text box */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-xl text-left relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-cyan-400 font-mono text-sm font-semibold leading-none">
                {currentIdx + 1}
              </span>
              <div className="space-y-1 flex-grow">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {language === "en" ? `Point Matrix: ${currentRQ.question.marks} Marks` : `পয়েন্ট ম্যাট্রিক্স: ${currentRQ.question.marks} পয়েন্ট`}
                  </span>
                  {exam.isQuestionTimerEnabled && (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase tracking-wider font-bold ${qTimeLeft <= 5 ? 'text-rose-400 border-rose-500 bg-rose-950/40 animate-pulse' : ''}`}>
                      <Clock className="w-3 h-3 animate-spin" />
                      {language === "en" ? `Auto-Next: ${qTimeLeft}s` : `অটো নেক্সট: ${qTimeLeft} সেকেন্ড`}
                    </span>
                  )}
                </div>
                <p className="text-base md:text-lg font-bold text-slate-100 leading-relaxed font-sans">
                  {currentRQ.question.questionText}
                </p>
              </div>
            </div>
          </div>

          {/* Options grid */}
          <div className="space-y-3">
            <p className="text-xxs uppercase tracking-wider text-slate-500 text-left font-sans pl-1">
              {t("mcqOptions")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentRQ.shuffledOptions.map((opt, rIdx) => {
                const selected = answers[currentRQ.question.id] === rIdx;
                const optLetter = ["A", "B", "C", "D"][rIdx];
                return (
                  <button
                    key={rIdx}
                    onClick={() => {
                      setAnswers(prev => ({
                        ...prev,
                        [currentRQ.question.id]: rIdx,
                      }));
                    }}
                    className={`flex items-center gap-3.5 p-4 rounded-xl text-left border font-sans cursor-pointer transition-all ${
                      selected 
                        ? "bg-gradient-to-r from-cyan-950 to-indigo-950 border-cyan-500 text-slate-100 font-semibold shadow-md shadow-cyan-500/5 hover:border-cyan-400 scale-[1.01]" 
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                      selected ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-400/40" : "bg-slate-800 text-slate-400"
                    }`}>
                      {optLetter}
                    </span>
                    <span className="text-sm md:text-base">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-850">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("prevButton")}
            </button>

            {currentIdx < runtimeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                {t("nextButton")}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleForceSubmit("manual")}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer hover:scale-105"
              >
                <Award className="w-4 h-4" />
                {t("submitExam")}
              </button>
            )}
          </div>
        </div>

        {/* Right side: Navigator Dashboard */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-left backdrop-blur-sm">
            <h3 className="text-xs font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3 font-sans">
              <Grid className="w-4 h-4 text-cyan-500" />
              {t("questionNavigator")}
            </h3>

            {/* Questions Grid index list */}
            <div className="grid grid-cols-4 xs:grid-cols-5 md:grid-cols-6 lg:grid-cols-3 gap-2">
              {runtimeQuestions.map((rq, idx) => {
                const isAnswered = answers[rq.question.id] !== undefined;
                const isCurrent = currentIdx === idx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-full py-2.5 rounded-lg border font-mono text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      isCurrent 
                        ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold scale-105 shadow-md shadow-cyan-500/20" 
                        : isAnswered 
                        ? "bg-slate-800/80 border-cyan-900/60 text-cyan-400" 
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[8px] opacity-60 font-sans mt-0.5">
                      {isAnswered ? "✔" : "•"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure mode warning reminders */}
          <div className="bg-rose-950/20 border border-rose-950 p-4 rounded-xl text-left">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider border-b border-rose-950/60 pb-1.5 mb-2 font-sans">
              <ShieldAlert className="w-4 h-4" />
              Anti-Cheat Info
            </div>
            <ul className="space-y-1.5 text-xxs text-rose-300 list-disc list-inside leading-relaxed font-sans">
              <li>{language === "en" ? "Fullscreen Mode is mandatory." : "ফুলস্ক্রিন মোড বাধ্যতামূলক।"}</li>
              <li>{language === "en" ? "Leaving tab triggers alert." : "ট্যাব পরিবর্তন সতর্কীকরণ বাড়ায়।"}</li>
              <li>{language === "en" ? "Copy, paste & right-click restricted." : "কপি, পেস্ট এবং ডান ক্লিক নিষ্ক্রিয়।"}</li>
              <li className="font-bold text-rose-200">
                {language === "en" ? "3 warnings = Auto-Submit." : "৩টি সতর্কতা = অটো-সাবমিট।"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
