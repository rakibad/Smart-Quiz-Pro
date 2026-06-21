/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Code, Copy, Check, FileSpreadsheet, ExternalLink, ShieldCheck, Database } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export const GoogleAppsScriptCode: React.FC = () => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const scriptCode = `/**
 * Smart Quiz Pro - Google Sheets Engine Webhook
 * Save this code in Extensions > Apps Script of your Google Sheet.
 * Author: Smart Quiz Pro Academic Module
 */

const SHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

function doPost(e) {
  const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  try {
    const jsonStr = e.postData.contents;
    const requestData = JSON.parse(jsonStr);
    const action = requestData.action;
    const payload = requestData.payload;
    
    let result = {};
    
    switch(action) {
      case "register":
        result = handleRegister(payload);
        break;
      case "saveResult":
        result = handleSaveResult(payload);
        break;
      case "saveCertificate":
        result = handleSaveCertificate(payload);
        break;
      case "getQuestions":
        result = handleGetQuestions();
        break;
      case "getNotifications":
        result = handleGetNotifications();
        break;
      default:
        throw new Error("Invalid action code specified.");
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(responseHeaders);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(responseHeaders);
  }
}

function doGet(e) {
  // Simple check system
  return ContentService.createTextOutput(JSON.stringify({ status: "online", service: "Smart Quiz Pro Database Engine v1.0" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 1. Student register sheet logs
function handleRegister(student) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("শিক্ষার্থীরা") || ss.insertSheet("শিক্ষার্থীরা");
  
  // Set headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "নাম", "ফোন", "ইমেইল", "প্রতিষ্ঠান", "ক্লাস", "রেজিস্ট্রেশন তারিখ"]);
  }
  
  sheet.appendRow([
    student.id,
    student.fullName,
    student.phone,
    student.email,
    student.institution,
    student.studentClass,
    new Date().toISOString()
  ]);
  
  return { registered: true, id: student.id };
}

// 2. Save Exam Results
function handleSaveResult(res) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("ফলাফল") || ss.insertSheet("ফলাফল");
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "শিক্ষার্থীর নাম", "ফোন", "পরীক্ষার নাম", "স্কোর", "সঠিক", "ভুল", "শতাংশ", "গ্রেড", "ফলাফল তারিখ"]);
  }
  
  sheet.appendRow([
    res.id,
    res.userName,
    res.phone,
    res.examTitle,
    res.score,
    res.correct,
    res.wrong,
    res.percentage,
    res.grade,
    new Date().toISOString()
  ]);
  
  return { saved: true, resultId: res.id };
}

// 3. Issue and record certificates logs
function handleSaveCertificate(cert) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("সার্টিফিকেটসমূহ") || ss.insertSheet("সার্টিফিকেটসমূহ");
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["সার্টিফিকেট আইডি", "শিক্ষার্থীর নাম", "পরীক্ষার নাম", "স্কোর", "শতাংশ", "গ্রেড", "ইস্যু তারিখ", "ভেরিফিকেশন কোড"]);
  }
  
  sheet.appendRow([
    cert.certificateId,
    cert.userName,
    cert.examTitle,
    cert.score,
    cert.percentage,
    cert.grade,
    new Date().toISOString(),
    cert.verificationCode
  ]);
  
  return { issued: true, code: cert.verificationCode };
}

// 4. Fetch Question Bank
function handleGetQuestions() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("প্রশ্নসমূহ");
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const questions = [];
  
  for(let i = 1; i < data.length; i++) {
    const row = data[i];
    questions.push({
      id: row[0],
      category: row[1],
      questionText: row[2],
      options: [row[3], row[4], row[5], row[6]],
      correctAnswer: parseInt(row[7]), // index 0-3
      marks: parseInt(row[8]),
      status: row[9]
    });
  }
  return questions;
}

// 5. Fetch recent Announcements
function handleGetNotifications() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("নোটিফিকেশনসমূহ");
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const notifications = [];
  
  for(let i = 1; i < data.length; i++) {
    const row = data[i];
    notifications.push({
      title: row[0],
      message: row[1],
      date: row[2]
    });
  }
  return notifications;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-90/50 hover:bg-slate-90 border border-slate-800 rounded-2xl text-left space-y-6 select-text">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-400">
            <Database className="w-4 h-4" />
            <span>Google Sheet Database Connector</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-100">
            {language === "en" ? "Google Apps Script Backend" : "গুগল অ্যাপস স্ক্রিপ্ট ব্যাকঅ্যান্ড কোড"}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {language === "en" 
              ? "Allows seamless synchronization of questions, results, issued certificates and users into structured columns."
              : "প্রশ্নসমূহ, শিক্ষার্থীদের তালিকা, পরীক্ষার ফলাফল এবং প্রাপ্ত সার্টিফিকেটের আপডেট গুগল স্প্রেডশিটে সংরক্ষণ করার শক্তিশালী স্ক্রিপ্ট।"}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-lg border border-slate-700 flex items-center gap-2 text-xs transition-colors shrink-0 cursor-pointer select-none"
        >
          {copied ? <Check className="w-4 text-emerald-400" /> : <Copy className="w-4 text-cyan-400" />}
          <span>{copied ? (language === "en" ? "Copied Code" : "কোড কপি হয়েছে") : (language === "en" ? "Copy Code Script" : "স্ক্রিপ্ট কপি করুন")}</span>
        </button>
      </div>

      {/* Deployment Guide Grid stepper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
        <div className="space-y-4 font-sans select-none">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {language === "en" ? "Sheet Mapping Configuration Schema" : "গুগল স্প্রেডশিট কলাম ম্যাপিং"}
          </h3>
          <ol className="space-y-3 text-xxs leading-relaxed text-slate-400 list-decimal list-inside pl-1">
            <li>
              <strong>{language === "en" ? "Sheet: 'প্রশ্নসমূহ' (Questions)" : "শীট: 'প্রশ্নসমূহ' (Questions)"}</strong>
              <div className="text-slate-500 pl-4 mt-1 font-mono">{language === "en" ? "Columns: ID, Category, Question, Option A, Option B, Option C, Option D, CorrectAnswer index, Marks, Status" : "কলামসমূহ: ID, ক্যাটেগরি, প্রশ্ন, অপশন A, অপশন B, অপশন C, অপশন D, সঠিক উত্তর (0-3), মার্কস, স্ট্যাটাস"}</div>
            </li>
            <li>
              <strong>{language === "en" ? "Sheet: 'শিক্ষার্থীরা' (Students)" : "শীট: 'শিক্ষার্থীরা' (Students)"}</strong>
              <div className="text-slate-500 pl-4 mt-1 font-mono">{language === "en" ? "Columns: ID, Name, Phone, Email, Institution, Class, RegistrationDate" : "কলামসমূহ: ID, নাম, ফোন, ইমেইল, প্রতিষ্ঠান, ক্লাস, রেজিস্ট্রেশন তারিখ"}</div>
            </li>
            <li>
              <strong>{language === "en" ? "Sheet: 'ফলাফল' (Results)" : "শীট: 'ফলাফল' (Results)"}</strong>
              <div className="text-slate-500 pl-4 mt-1 font-mono">{language === "en" ? "Columns: ID, StudentName, Phone, ExamTitle, Score, Correct, Wrong, Percentage, Grade, ResultDate" : "কলামসমূহ: ID, শিক্ষার্থীর নাম, ফোন, পরীক্ষার নাম, স্কোর, সঠিক, ভুল, শতাংশ, গ্রেড, ফলাফল তারিখ"}</div>
            </li>
            <li>
              <strong>{language === "en" ? "Sheet: 'সার্টিফিকেটসমূহ' (Certificates)" : "শীট: 'সার্টিফিকেটসমূহ' (Certificates)"}</strong>
              <div className="text-slate-500 pl-4 mt-1 font-mono">{language === "en" ? "Columns: CertificateId, StudentName, ExamTitle, Score, Percentage, Grade, IssueDate, VerificationCode" : "কলামসমূহ: সার্টিফিকেট আইডি, শিক্ষার্থীর নাম, পরীক্ষার নাম, স্কোর, শতাংশ, গ্রেড, ইস্যু তারিখ, ভেরিফিকেশন কোড"}</div>
            </li>
          </ol>
        </div>

        <div className="space-y-4 font-sans select-none">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            {language === "en" ? "Deployment Stepper Instructions" : "ডিপ্লয়মেন্ট নির্দেশিকা গাইড"}
          </h3>
          <ul className="space-y-2.5 text-xxs text-slate-400 leading-relaxed list-disc list-inside pl-1">
            <li>{language === "en" ? "Go to your Google Sheets dashboard, create a new spreadsheet." : "গুগল ড্রাইভে গিয়ে একটি স্প্রেডশিট ফাইল তৈরি করুন।"}</li>
            <li>{language === "en" ? "Click 'Extensions' > 'Apps Script' on the top main toolbar." : "মেনুবারের Extensions থেকে Apps Script অপশনটিতে ক্লিক করুন।"}</li>
            <li>{language === "en" ? "Delete all existing file text and paste this copied script code inside." : "সেখানকার ডিফল্ট কোড মুছে দিয়ে পূর্বে কপি করা স্ক্রিপ্ট কোডটি পেস্ট করুন।"}</li>
            <li>
              {language === "en" 
                ? "Replace 'YOUR_SPREADSHEET_ID_HERE' with your real URL alphanumeric string." 
                : "কোডের SHEET_ID ভ্যারিয়েবেলে আপনার স্প্রেডশিটের আসল আইডি যুক্ত করুন।"}
            </li>
            <li>{language === "en" ? "Click 'Deploy' > 'New Deployment' and select type 'Web App'." : "ডিপ্লয় (Deploy) থেকে New Deployment এ গিয়ে Web App সিলেক্ট করুন।"}</li>
            <li>
              {language === "en" 
                ? "Set Access to 'Anyone', execute as 'Me', click Deploy and copy Web App endpoint URL into active Admin Settings!" 
                : "Access অপশনে Anyone যুক্ত করে ডিপ্লয় করুন এবং প্রাপ্ত Web App URL লিংকটি আমাদের অ্যাডমিন সেটিংসের API বক্সে সেভ করুন!"}
            </li>
          </ul>
        </div>
      </div>

      {/* Compact Interactive Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner font-mono text-xs text-slate-300 relative">
        <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-850 select-none">
          <span className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1">
            <Code className="w-3.5" />
            smart-sheets-endpoint.gs
          </span>
          <span className="text-[10px] text-emerald-400">Google Script API ready</span>
        </div>
        <pre className="p-4 max-h-60 overflow-y-auto w-full text-left scrollbar-thin text-[11px] leading-relaxed select-text">
          <code>{scriptCode}</code>
        </pre>
      </div>
    </div>
  );
};
