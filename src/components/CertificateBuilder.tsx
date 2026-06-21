/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { Certificate, CertificateType } from "../types";
import { Award, Download, Printer, Share2, CheckCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface CertificateBuilderProps {
  certificate: Certificate;
  onClose?: () => void;
}

export const CertificateBuilder: React.FC<CertificateBuilderProps> = ({ certificate, onClose }) => {
  const { language, t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Create a temporary print frame or window style
      const style = document.createElement("style");
      style.innerHTML = `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .cert-container {
            border: 15px double #c9a054 !important;
            padding: 40px !important;
            background: #ffffff !important;
            color: #0d1117 !important;
            box-shadow: none !important;
            width: 100% !important;
            height: auto !important;
          }
          .cert-glow {
            box-shadow: none !important;
          }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}?verify=${certificate.verificationCode}`;
    if (navigator.share) {
      navigator.share({
        title: `Smart Quiz Certification`,
        text: `Check out ${certificate.userName}'s Certificate of ${certificate.certificateType} in ${certificate.examTitle}!`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert(language === "en" ? "Verification Link copied to clipboard!" : "যাচাইকরণ লিংক ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  const typeLabel = {
    [CertificateType.PARTICIPATION]: language === "en" ? "Certificate of Participation" : "অংশগ্রহণ সার্টিফিকেট",
    [CertificateType.COMPLETION]: language === "en" ? "Certificate of Completion" : "সম্পন্নকরণ সার্টিফিকেট",
    [CertificateType.ACHIEVEMENT]: language === "en" ? "Certificate of Achievement" : "অর্জন সার্টিফিকেট",
  };

  const verifyUrl = `${window.location.origin}/?verify=${certificate.verificationCode}`;

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end w-full mb-4 no-print">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/10 flex items-center gap-2 text-sm transition-all hover:scale-105"
        >
          <Printer className="w-4 block" />
          {t("printCertificate")}
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 flex items-center gap-2 text-sm transition-all hover:scale-105"
        >
          <Share2 className="w-4 block" />
          {t("shareCertificate")}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-medium rounded-lg border border-rose-500/30 text-sm transition-all"
          >
            {language === "en" ? "Close" : "বন্ধ করুন"}
          </button>
        )}
      </div>

      {/* Main Certificate Design Container (Print Target) */}
      <div ref={printRef} className="w-full relative bg-slate-950 rounded-2xl p-1 md:p-1 overflow-hidden cert-glow shadow-2xl border border-slate-700/60">
        
        {/* Background Decorative Grid/Abstract lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-amber-500/30 rounded-tl-xl pointer-events-none m-4" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-amber-500/30 rounded-tr-xl pointer-events-none m-4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-amber-500/30 rounded-bl-xl pointer-events-none m-4" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-amber-500/30 rounded-br-xl pointer-events-none m-4" />

        <div className="border-[14px] border-double border-amber-500/40 rounded-xl p-6 md:p-12 text-center text-slate-100 relative z-10">
          
          {/* Header Flourish */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-amber-500/20 blur-lg rounded-full" />
              <Award className="w-16 h-16 text-amber-500 relative z-10 animate-pulse" />
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-wide text-amber-400 mb-2 uppercase">
            {language === "en" ? "Certificate" : "সার্টিফিকেট"}
          </h1>
          <p className="font-serif italic text-sm md:text-base text-amber-500/80 tracking-wider mb-8 uppercase">
            {typeLabel[certificate.certificateType]}
          </p>

          <p className="text-slate-400 max-w-md mx-auto text-xs md:text-sm mb-6 font-sans">
            {language === "en" 
              ? "This is to officially recognize and certify that" 
              : "এতদ্দ্বারা গর্বের সাথে প্রত্যয়ন করা যাচ্ছে যে"}
          </p>

          {/* Student Name */}
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-100 border-b border-amber-500/30 pb-3 max-w-xl mx-auto mb-4 tracking-wide font-medium">
            {certificate.userName}
          </h2>

          {/* Core Info Block */}
          <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-6 font-sans">
            {language === "en" ? (
              <>
                has successfully demonstrated proficiency and passed the assessment for <strong>{certificate.examTitle}</strong> with a final score of <strong>{certificate.score}</strong> ({certificate.percentage}%) and was awarded Grade <strong>{certificate.grade}</strong>.
              </>
            ) : (
              <>
                সফলতার সাথে নিজের মেধার স্বাক্ষর রেখে <strong>{certificate.examTitle}</strong> পরীক্ষাটি সম্পন্ন করেছেন। উক্ত পরীক্ষায় তার প্রাপ্ত স্কোর <strong>{certificate.score}</strong> ({certificate.percentage}%) এবং অর্জিত গ্রেড হলো <strong>{certificate.grade}</strong>।
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-10 pt-6 border-t border-slate-800/80 max-w-3xl mx-auto">
            
            {/* Left side: Metadata Column */}
            <div className="text-left space-y-2 md:border-r border-slate-800/80 pr-4">
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{language === "en" ? "Student ID: " : "স্টুডেন্ট আইডি: "}</span>
                {certificate.studentId}
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{language === "en" ? "Issue Date: " : "ইস্যু তারিখ: "}</span>
                {new Date(certificate.issueDate).toLocaleDateString(language === "en" ? "en-US" : "bn-BD")}
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{language === "en" ? "Credential ID: " : "সার্টিফিকেট আইডি: "}</span>
                <span className="font-mono text-amber-500/90 font-semibold">{certificate.certificateId}</span>
              </div>
            </div>

            {/* Middle: Signature with Logo Flag */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-10 w-24 relative flex items-center justify-center">
                {certificate.signatureUrl ? (
                  <img src={certificate.signatureUrl} alt="Admin Signature" className="h-full object-contain filter brightness-110" referrerPolicy="no-referrer" />
                ) : (
                  <div className="font-serif italic text-lg text-amber-300 border-b border-amber-500/50 relative">
                    Smart Quiz Pro Admin
                    {/* Retro Gold Stamp Overlay */}
                    <div className="absolute -top-3 -right-6 w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/5 flex items-center justify-center rotate-12">
                      <ShieldCheck className="w-5 text-amber-500" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xxs uppercase tracking-wider text-slate-500 font-sans border-t border-slate-800 w-24 pt-1">
                {language === "en" ? "Authorized Signature" : "অনুমোদিত স্বাক্ষর"}
              </span>
            </div>

            {/* Right: Validation QR Code simulation */}
            <div className="flex flex-col items-center justify-center md:items-end md:text-right">
              <div className="p-2 bg-stone-900 rounded-lg border border-amber-500/20 shadow-md flex items-center justify-center w-20 h-20">
                {/* SVG QR Code Simulation */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-amber-500">
                  <path d="M5 5h30v30H5V5zm6 6v18h18V11H11zm50-6h30v30H61V5zm6 6v18h18V11H67zM5 61h30v30H5V61zm6 6v18h18V67H11zm35-36h8v8h-8v-8zm10 10h8v8h-8v-8zm10 40h8v8h-8v-8zm10 10h8v8H71v-8zm-20-10h8v8h-8v-8zm-10-10h8v8h-8v-8zm20-10h8v8h-8v-8zm-10 30h8v8h-8v-8z" fill="currentColor"/>
                </svg>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-sans">
                <ShieldCheck className="w-3" />
                <span>{language === "en" ? "QR Verified Sec" : "কিউআর ভেরিফাইড"}</span>
              </div>
            </div>

          </div>

          <div className="mt-6 text-[10px] text-slate-500 font-mono text-center">
            {language === "en" ? "Verify this digital certificate authentic online at: " : "অনলাইনে এই সার্টিফিকেটের সত্যতা যাচাই করুন: "}
            <span className="text-amber-500/70 underline">{verifyUrl}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
