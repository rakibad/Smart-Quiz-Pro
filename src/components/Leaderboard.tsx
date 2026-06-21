/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trophy, Search, School, Star, Award, Sparkles } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface LeaderboardRecord {
  rank: number;
  name: string;
  institution: string;
  examsCompleted: number;
  totalScore: number;
  averagePercent: number;
  badge: string;
}

export const Leaderboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Seed simulated high scores + merge any actual local user achievements if applicable
  const staticRecords: LeaderboardRecord[] = [
    { rank: 1, name: "Ayaan Rahman", institution: "Dhaka Residential Model College", examsCompleted: 6, totalScore: 145, averagePercent: 96, badge: "Master Scholar" },
    { rank: 2, name: "Nusrat Jahan", institution: "Viqarunnisa Noon College", examsCompleted: 5, totalScore: 110, averagePercent: 92, badge: "Grand Wizard" },
    { rank: 3, name: "Tasnim Ahmed", institution: "Rajshahi College", examsCompleted: 5, totalScore: 105, averagePercent: 88, badge: "Champion" },
    { rank: 4, name: "Sajid Hasan", institution: "Chittagong College", examsCompleted: 4, totalScore: 85, averagePercent: 85, badge: "Senior Achiever" },
    { rank: 5, name: "Tabassum Ara", institution: "Holy Cross College", examsCompleted: 3, totalScore: 70, averagePercent: 82, badge: "Rising Star" },
    { rank: 6, name: "Imran Khan", institution: "Sylhet Cadet College", examsCompleted: 3, totalScore: 65, averagePercent: 78, badge: "Expert Student" },
  ];

  const filtered = staticRecords.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.institution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            {language === "en" ? "Top Scholars Leaderboard" : "শীর্ষ মেধা লিডারবোর্ড"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === "en" 
              ? "Honoring the fastest solvers with the highest precision records." 
              : "সর্বোচ্চ স্কোর এবং নির্ভুলতায় এগিয়ে থাকা চমৎকার শিক্ষার্থীদের তালিকা।"}
          </p>
        </div>

        {/* Local Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-sans"
            placeholder={language === "en" ? "Search scholar name or location" : "শিক্ষার্থী বা শিক্ষাপ্রতিষ্ঠান খুঁজুন"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Podium displays (Top 3 highlighting cards) */}
      {searchQuery === "" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
          {/* Rank 2 (Silver) */}
          <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-800 rounded-lg text-slate-400 font-bold font-mono text-xs border border-slate-700">2nd</div>
            <div className="w-12 h-12 rounded-full border border-slate-400 bg-slate-400/10 flex items-center justify-center mt-2 group-hover:scale-115 transition-transform">
              <Star className="w-5 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-3">{staticRecords[1].name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
              <School className="w-3" />
              {staticRecords[1].institution}
            </p>
            <div className="mt-3 text-xxs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded">
              {staticRecords[1].averagePercent}% {language === "en" ? "Index" : "সূচক"}
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="p-6 bg-gradient-to-b from-slate-90/50 to-slate-951 border border-amber-500/30 hover:border-amber-500/50 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center shadow-xl shadow-amber-500/5 group scale-[1.03]">
            {/* Crown sparkles icon */}
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg text-slate-950 font-bold font-mono text-xs flex items-center gap-0.5">
              <Sparkles className="w-3 text-slate-950 fill-slate-950" />
              1st
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center mt-2 shadow-lg shadow-amber-500/10 group-hover:scale-115 transition-transform">
              <Trophy className="w-8 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-4">{staticRecords[0].name}</h3>
            <p className="text-[10px] text-amber-500/80 mt-1 font-bold">★ {staticRecords[0].badge}</p>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 flex items-center gap-1 justify-center">
              <School className="w-3" />
              {staticRecords[0].institution}
            </p>
            <div className="mt-4 text-xxs font-mono text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-md">
              {staticRecords[0].averagePercent}% {language === "en" ? "Index" : "সূচক"}
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-800 rounded-lg text-amber-700 font-bold font-mono text-xs border border-slate-750">3rd</div>
            <div className="w-12 h-12 rounded-full border border-amber-700 bg-amber-700/10 flex items-center justify-center mt-2 group-hover:scale-115 transition-transform">
              <Award className="w-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-3">{staticRecords[2].name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
              <School className="w-3" />
              {staticRecords[2].institution}
            </p>
            <div className="mt-3 text-xxs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded">
              {staticRecords[2].averagePercent}% {language === "en" ? "Index" : "সূচক"}
            </div>
          </div>
        </div>
      )}

      {/* Main rankings list */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 uppercase text-[9px] tracking-wider font-mono">
                <th className="py-3.5 px-5 select-none">{language === "en" ? "Rank" : "র‍্যাংক"}</th>
                <th className="py-3.5 px-5">{language === "en" ? "Scholar Candidate" : "শিক্ষার্থী"}</th>
                <th className="py-3.5 px-5">{language === "en" ? "Corporate/University" : "শিক্ষা প্রতিষ্ঠান"}</th>
                <th className="py-3.5 px-5 text-center">{language === "en" ? "Tests Taken" : "অংশগ্রহণ"}</th>
                <th className="py-3.5 px-5 text-center">{language === "en" ? "Performance index" : "গড় স্কোর"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300 font-sans">
              {filtered.map((record, index) => (
                <tr key={index} className="hover:bg-slate-90/30 transition-all">
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-100">
                    <span className={`inline-block py-0.5 px-2 rounded font-bold text-xxs ${
                      record.rank === 1 ? "bg-amber-500 text-slate-950 font-sans uppercase font-bold" :
                      record.rank === 2 ? "bg-slate-400 text-slate-950" :
                      record.rank === 3 ? "bg-amber-700 text-slate-950" :
                      "bg-slate-800 text-slate-300"
                    }`}>
                      #{record.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-200 block">{record.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono font-medium">{record.badge}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 truncate max-w-xs">{record.institution}</td>
                  <td className="py-3.5 px-5 text-center font-mono text-slate-200">{record.examsCompleted}</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-400">
                    {record.averagePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
