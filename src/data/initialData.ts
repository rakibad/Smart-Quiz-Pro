/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, QuestionStatus, Exam, Notification, AdminSettings } from "../types";

export const initialQuestions: Question[] = [
  // Category: ICT & Technology
  {
    id: "q-ict-1",
    category: "ICT & Tech",
    questionText: "Which protocols are used for secure web browsing communication over the internet?",
    options: ["HTTP", "HTTPS", "FTP", "SMTP"],
    correctAnswer: 1, // HTTPS
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-ict-2",
    category: "ICT & Tech",
    questionText: "What is the primary brain of a computer system where logic and calculations take place?",
    options: ["RAM", "SSD", "CPU", "Motherboard"],
    correctAnswer: 2, // CPU
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-ict-3",
    category: "ICT & Tech",
    questionText: "In networking, what is the length of an IPv6 address?",
    options: ["32 bits", "64 bits", "128 bits", "256 bits"],
    correctAnswer: 2, // 128 bits
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-ict-4",
    category: "ICT & Tech",
    questionText: "Which web language is primarily responsible for the layout and structure of a page?",
    options: ["CSS", "JavaScript", "Python", "HTML5"],
    correctAnswer: 3, // HTML5
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-ict-5",
    category: "ICT & Tech",
    questionText: "Which of the following database styles is relational by definition?",
    options: ["MongoDB", "PostgreSQL", "Redis", "Cassandra"],
    correctAnswer: 1, // PostgreSQL
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },

  // Category: Bangladesh Affairs
  {
    id: "q-bd-1",
    category: "Bangladesh",
    questionText: "When is the National Victory Day of Bangladesh celebrated?",
    options: ["16th December", "26th March", "21st February", "14th April"],
    correctAnswer: 0, // 16th December
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-bd-2",
    category: "Bangladesh",
    questionText: "Which river is known as the widest river in Bangladesh?",
    options: ["Padma", "Meghna", "Jamuna", "Karnaphuli"],
    correctAnswer: 1, // Meghna
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-bd-3",
    category: "Bangladesh",
    questionText: "Who was the historical architect of the National Martyrs' Memorial (Jatiyo Smriti Soudho)?",
    options: ["Muzharul Islam", "Syed Mainul Hossain", "Hamidur Rahman", "Shamim Sikder"],
    correctAnswer: 1, // Syed Mainul Hossain
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-bd-4",
    category: "Bangladesh",
    questionText: "How many UNESCO World Heritage sites are situated inside Bangladesh?",
    options: ["2 sites", "3 sites", "5 sites", "1 site"],
    correctAnswer: 1, // 3 sites (Sundarbans, Bagerhat Mosque City, Paharpur Vihara)
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },

  // Category: General Science
  {
    id: "q-sci-1",
    category: "General Science",
    questionText: "What element does the symbol 'O' represent in the periodic table?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: 1, // Oxygen
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-sci-2",
    category: "General Science",
    questionText: "What is the speed of light in vacuum approximately?",
    options: ["150,000 km/s", "300,000 km/s", "500,000 km/s", "1,000,000 km/s"],
    correctAnswer: 1, // 300k km/s
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
  {
    id: "q-sci-3",
    category: "General Science",
    questionText: "Which gas is mainly responsible for global warming in the atmosphere?",
    options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Helium"],
    correctAnswer: 1, // Carbon Dioxide
    marks: 5,
    status: QuestionStatus.ACTIVE,
  },
];

export const initialExams: Exam[] = [
  {
    id: "exam-ict",
    title: "ICT and Computer Science Pro Exam",
    category: "ICT & Tech",
    durationMinutes: 10,
    passPercentage: 60,
    totalMarks: 25,
    createdAt: "2026-06-20T10:00:00Z",
    published: true,
    questionIds: ["q-ict-1", "q-ict-2", "q-ict-3", "q-ict-4", "q-ict-5"],
  },
  {
    id: "exam-bd",
    title: "National History & Bangladesh Studies",
    category: "Bangladesh",
    durationMinutes: 8,
    passPercentage: 50,
    totalMarks: 20,
    createdAt: "2026-06-19T14:30:00Z",
    published: true,
    questionIds: ["q-bd-1", "q-bd-2", "q-bd-3", "q-bd-4"],
  },
  {
    id: "exam-sci",
    title: "General Physics & Atmospheric Sciences",
    category: "General Science",
    durationMinutes: 5,
    passPercentage: 60,
    totalMarks: 15,
    createdAt: "2026-06-21T09:00:00Z",
    published: true,
    questionIds: ["q-sci-1", "q-sci-2", "q-sci-3"],
  },
];

export const initialNotifications: Notification[] = [
  {
    title: "Smart Quiz Pro Launched!",
    message: "Welcome to Bangladesh's premium online testing with modern real-time certificate issuance.",
    date: "2026-06-21",
    category: "System",
  },
  {
    title: "Next ICT Championship 2026 Scheduled",
    message: "New professional ICT and Computer Science test is active. Clear it with A+ and earn Achievement Badge.",
    date: "2026-06-20",
    category: "New Exam",
  },
  {
    title: "Verification Endpoint Live",
    message: "Secure validation IDs with printable high definition signatures can now be instantly verified from the navbar.",
    date: "2026-06-19",
    category: "General",
  },
];

export const initialSettings: AdminSettings = {
  websiteName: "Smart Quiz Pro",
  logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
  contactNumber: "+8801700000000",
  facebookLink: "https://facebook.com/smartquizpro",
  whatsappLink: "https://wa.me/8801700000000",
  telegramLink: "https://t.me/smartquizpro",
  youtubeLink: "https://youtube.com/c/smartquizpro",
  primaryColor: "#00f0ff", // Neon Cyan
};
