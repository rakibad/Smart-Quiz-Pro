/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  institution: string;
  studentClass: string;
  studentId: string;
  registrationDate: string;
}

export enum QuestionStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface Question {
  id: string;
  category: string;
  questionText: string;
  options: string[]; // Always 4 options
  correctAnswer: number; // Index 0-3
  marks: number;
  status: QuestionStatus;
}

export interface Exam {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  passPercentage: number;
  totalMarks: number;
  createdAt: string;
  published: boolean;
  questionIds: string[];
  isQuestionTimerEnabled?: boolean;
  questionTimerSeconds?: number;
  quizType?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  userId: string;
  score: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  percentage: number;
  grade: string;
  passed: boolean;
  attemptDate: string;
  certificateId?: string;
  tabSwitchesCount: number;
  cheatWarningsTriggered: number;
}

export enum CertificateType {
  PARTICIPATION = "Participation",
  COMPLETION = "Completion",
  ACHIEVEMENT = "Achievement",
}

export interface Certificate {
  certificateId: string;
  userId: string;
  userName: string;
  studentId: string;
  examId: string;
  examTitle: string;
  score: number;
  percentage: number;
  grade: string;
  issueDate: string;
  verificationCode: string; // Unique cryptographic or readable key
  certificateType: CertificateType;
  signatureUrl?: string;
  logoUrl?: string;
}

export interface Notification {
  title: string;
  message: string;
  date: string;
  category: "New Exam" | "General" | "Result" | "System";
}

export interface AdminSettings {
  websiteName: string;
  logoUrl: string;
  contactNumber: string;
  facebookLink: string;
  whatsappLink: string;
  telegramLink: string;
  youtubeLink: string;
  primaryColor: string; // Hex color for highlights e.g. #00f0ff (cyan)
  logoPath?: string;
  signaturePath?: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  activity: string;
  device: string;
  ipPlaceholder: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    bn: string;
  };
}
