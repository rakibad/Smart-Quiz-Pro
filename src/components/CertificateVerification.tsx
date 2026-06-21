/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Certificate } from "../types";
import { Search, ShieldCheck, ShieldAlert, Award, Calendar, CheckCircle2, QrCode } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface CertificateVerificationProps {
  initialSearchCode?: string;
  onClose?: () => void;
}

export const CertificateVerification: React.FC<CertificateVerificationProps> = ({ initialSearchCode = "", onClose }) => {
  const { language, t } = useLanguage();
  const [certId, setCertId] = useState(initialSearchCode);
  const [result, setResult] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialSearchCode) {
      setCertId(initialSearchCode);
      handleVerify(initialSearchCode);
    }
  }, [initialSearchCode]);

  const handleVerify = (idToSearch?: string) => {
    const code = (idToSearch || certId).trim().toUpperCase();
    if (!code) return;

    setSearched(true);
    // Find in localStorage certificated database
    const storedCerts: Certificate[] = JSON.parse(localStorage.getItem("smart_quiz_certs") || "[]");
    const cert = storedCerts.find(c => c.certificateId.toUpperCase() === code || c.verificationCode.toUpperCase() === code);
    
    if (cert) {
      setResult(cert);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-950/40 rounded-full border border-cyan-500/20 mb-3">
          <QrCode className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
          {t("verificationTitle")}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {language === "en" 
            ? "Enter the 12-char unique verification identifier to check legitimacy." 
            : "সার্টিফিকেটের সত্যতা ও মেধা যাচাইয়ের জন্য ইউনিক ১-১২ সংখ্যার কোডটি লিখুন।"}
        </p>
      </div>

      {/* Verification Query Input */}
      <div className="flex gap-2 max-w-lg mx-auto mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 focus:outline-none text-sm transition-all"
            placeholder={t("verifyPlaceHolder")}
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
          />
        </div>
        <button
          onClick={() => handleVerify()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/10 text-sm"
        >
          {t("verifyButton")}
        </button>
      </div>

      {/* Results Dynamic Container */}
      {searched && (
        <div className="transition-all animate-fade-in">
          {result ? (
            /* Successful Authentic Certificate Details Card */
            <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 font-bold text-xxs text-emerald-400 rounded-full border border-emerald-500/40 mb-3">
                    <CheckCircle2 className="w-3" />
                    <span>{language === "en" ? "VERIFIED AUTHENTIC" : "বৈধ সার্টিফিকেট"}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-100">{result.userName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === "en" 
                      ? `Student ID / Roll: ${result.studentId}` 
                      : `স্টুডেন্ট আইডি / রোল: ${result.studentId}`}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <div className="text-xxs uppercase tracking-wider text-slate-500">{language === "en" ? "Assessment Course" : "পরীক্ষার নাম"}</div>
                      <div className="text-sm font-semibold text-slate-300">{result.examTitle}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xxs uppercase tracking-wider text-slate-500">{language === "en" ? "Credential Identifier" : "ভেরিফিকেশন আইডি"}</div>
                      <div className="text-sm font-mono font-semibold text-amber-500">{result.certificateId}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xxs uppercase tracking-wider text-slate-500">{language === "en" ? "Result Metrics" : "প্রাপ্ত ফলাফল ও গ্রেড"}</div>
                      <div className="text-sm font-semibold text-slate-300">
                        {language === "en" 
                          ? `${result.score} Marks (${result.percentage}%) - Grade ${result.grade}` 
                          : `${result.score} নম্বর (${result.percentage}%) - গ্রেড ${result.grade}`}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xxs uppercase tracking-wider text-slate-500">{language === "en" ? "Date Confirmed" : "ইস্যুর তারিখ"}</div>
                      <div className="text-sm text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 text-slate-400" />
                        <span>{new Date(result.issueDate).toLocaleDateString(language === "en" ? "en-US" : "bn-BD")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed font-sans">
                    {language === "en" 
                      ? "This ledger verifies that the holder achieved the certificate passing criteria and holds the corresponding record on the Google Sheet central logs."
                      : "এই কেন্দ্রীয় খতিয়ান নিশ্চিত করে যে পরীক্ষার্থী সফলভাবে পরীক্ষায় উত্তীর্ণ হয়েছেন এবং এর সংশ্লিষ্ট রেকর্ড গুগল শিট সেন্ট্রাল ডাটাবেজে যথাযথভাবে নিবন্ধিত রয়েছে।"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Invalid Certificate Warning Card */
            <div className="border border-rose-500/30 bg-rose-950/20 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-3 bg-rose-905/30 rounded-xl border border-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-rose-950 font-bold text-xxs text-rose-400 rounded-full border border-rose-500/40 mb-3">
                  <span>{language === "en" ? "UNVERIFIED" : "অবৈধ সার্টিফিকেট"}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {language === "en" ? "Verification Failure" : "যাচাইকরণ ব্যর্থ হয়েছে"}
                </h3>
                <p className="text-xs text-rose-300 mt-1 max-w-md leading-relaxed">
                  {language === "en" 
                    ? "The ID you entered does not match any certificate in our secure ledger. Pleae check spelling or re-verify with the academic admin." 
                    : "আপনার প্রদানকৃত সার্টিফিকেট আইডিটি আমাদের ডাটাবেজে পাওয়া যায়নি। দয়া করে সঠিক কোডটি পুনরায় চেক করুন অথবা এডমিন প্যানেলের সাথে অতিসত্বর যোগাযোগ করুন।"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
