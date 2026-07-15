export type TrainerLevel = {
  code: string;
  name: string;
  rating: string;
  description: string;
};

export const trainerLevels: TrainerLevel[] = [
  { code: "DI", name: "Developmental Instructor", rating: "Up to 1200", description: "Supports beginner chess players." },
  { code: "NI", name: "National Instructor", rating: "1201–1700", description: "National certified instructor." },
  { code: "FI", name: "FIDE Instructor", rating: "1701–1900", description: "Official international instructor." },
  { code: "FT", name: "FIDE Trainer", rating: "1901–2200", description: "Professional trainer certified by FIDE." },
  { code: "FST", name: "FIDE Senior Trainer", rating: "2201–2450", description: "Highest FIDE trainer certification." },
];

export type Event = {
  id: string;
  country: string;
  flag: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  trainers: string[];
  description: string;
  examDate: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
};

export const events: Event[] = [
  {
    id: "mm-01",
    country: "Myanmar",
    flag: "🇲🇲",
    name: "FIDE Trainer Seminar — Yangon",
    date: "15/08/2026",
    time: "09:00 MMT",
    venue: "Sedona Hotel, Yangon",
    trainers: ["GM Wesley So", "IM Aung Aung", "FT Nay Oo"],
    description: "A five-day intensive seminar covering middlegame strategy, endgame technique, and modern opening theory for aspiring FIDE trainers.",
    examDate: "22/08/2026",
    zoomLink: "https://zoom.us/j/98765432101",
    meetingId: "987 6543 2101",
    passcode: "FTNMM26",
  },
  {
    id: "us-01",
    country: "United States",
    flag: "🇺🇸",
    name: "FIDE Trainer Seminar — New York",
    date: "10/09/2026",
    time: "10:00 MMT",
    venue: "Marshall Chess Club, NYC",
    trainers: ["GM Fabiano Caruana", "IM Danny Rensch", "FT Sara Chen"],
    description: "In-person seminar with world-class coaches on modern preparation, engine-assisted analysis, and pedagogical techniques.",
    examDate: "17/09/2026",
    zoomLink: "https://zoom.us/j/12345678909",
    meetingId: "123 4567 8909",
    passcode: "FTNUS26",
  },
  {
    id: "in-01",
    country: "India",
    flag: "🇮🇳",
    name: "FIDE Trainer Seminar — Chennai",
    date: "20/10/2026",
    time: "11:30 MMT",
    venue: "Tal Chess Academy, Chennai",
    trainers: ["GM Viswanathan Anand", "GM Vidit Gujrathi", "FT Priya Rao"],
    description: "Comprehensive trainer certification program with a focus on youth development and tournament preparation.",
    examDate: "27/10/2026",
    zoomLink: "https://zoom.us/j/55566677788",
    meetingId: "555 6667 7788",
    passcode: "FTNIN26",
  },
];

export type Trainer = {
  id: string;
  name: string;
  country: string;
  title: string;
  rating: number;
  bio: string;
  experience: string;
  expertise: string[];
  languages: string[];
  initials: string;
  color: string;
};

export const trainers: Trainer[] = [
  {
    id: "t1",
    name: "GM Wesley Chen",
    country: "United States",
    title: "FIDE Senior Trainer",
    rating: 2680,
    bio: "Three-time national champion with 15 years of coaching experience. Author of Modern Endgame Practice.",
    experience: "15+ years",
    expertise: ["Endgame Theory", "Positional Play", "Opening Preparation"],
    languages: ["English", "Mandarin"],
    initials: "WC",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "t2",
    name: "IM Priya Sharma",
    country: "India",
    title: "FIDE Trainer",
    rating: 2410,
    bio: "Women's national team coach specializing in youth development and tactical training.",
    experience: "10+ years",
    expertise: ["Tactics", "Youth Coaching", "Middlegame"],
    languages: ["English", "Hindi", "Tamil"],
    initials: "PS",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "t3",
    name: "FM Aung Kyaw",
    country: "Myanmar",
    title: "FIDE Instructor",
    rating: 2280,
    bio: "Southeast Asian championship medalist. Dedicated to growing chess across Myanmar.",
    experience: "8+ years",
    expertise: ["Fundamentals", "Openings", "Rapid & Blitz"],
    languages: ["English", "Burmese"],
    initials: "AK",
    color: "from-indigo-500 to-purple-600",
  },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  emoji: string;
};

export const productCategories = ["Chess Sets", "Chess Pieces", "Chess Boards", "Chess Accessories"] as const;

export const products: Product[] = [
  { id: "s1", category: "Chess Sets", name: "Wooden Set", price: 130, description: "Handcrafted rosewood tournament set.", emoji: "♛" },
  { id: "s2", category: "Chess Sets", name: "Plastic Set", price: 44, description: "Durable weighted plastic set for clubs.", emoji: "♟" },
  { id: "s3", category: "Chess Sets", name: "Digital Set", price: 1709, description: "Premium digital sensor board with app sync.", emoji: "♞" },
  { id: "s4", category: "Chess Sets", name: "Vinyl Set", price: 15, description: "Portable roll-up vinyl set.", emoji: "♜" },
  { id: "s5", category: "Chess Sets", name: "Leather Set", price: 55, description: "Elegant leather-bound set with pieces.", emoji: "♚" },
  { id: "p1", category: "Chess Pieces", name: "Wooden Pieces", price: 460, description: "Staunton weighted rosewood pieces.", emoji: "♛" },
  { id: "p2", category: "Chess Pieces", name: "Plastic Pieces", price: 42, description: "Tournament plastic pieces.", emoji: "♟" },
  { id: "p3", category: "Chess Pieces", name: "Digital Pieces", price: 770, description: "Smart RFID pieces for electronic boards.", emoji: "♞" },
  { id: "p4", category: "Chess Pieces", name: "Vinyl Pieces", price: 42, description: "Silicone tournament pieces.", emoji: "♜" },
  { id: "p5", category: "Chess Pieces", name: "Leather Pieces", price: 42, description: "Soft leather-crafted pieces.", emoji: "♚" },
  { id: "b1", category: "Chess Boards", name: "Wooden Board", price: 409, description: "Solid walnut & maple tournament board.", emoji: "▦" },
  { id: "b2", category: "Chess Boards", name: "Plastic Board", price: 439, description: "Weighted plastic tournament board.", emoji: "▦" },
  { id: "b3", category: "Chess Boards", name: "Digital Board", price: 800, description: "Smart sensor tournament board.", emoji: "▦" },
  { id: "b4", category: "Chess Boards", name: "Vinyl Board", price: 5, description: "Portable vinyl roll-up board.", emoji: "▦" },
  { id: "b5", category: "Chess Boards", name: "Leather Board", price: 25, description: "Premium leather board.", emoji: "▦" },
  { id: "a1", category: "Chess Accessories", name: "Chess Storage Box", price: 130, description: "Premium wooden storage for pieces.", emoji: "📦" },
  { id: "a2", category: "Chess Accessories", name: "Chess Bag", price: 554, description: "Deluxe travel bag for board & pieces.", emoji: "🎒" },
  { id: "a3", category: "Chess Accessories", name: "Digital Chess Clock", price: 409, description: "FIDE-approved digital clock.", emoji: "⏱️" },
];

export const stats = [
  { label: "Trainers", value: 428 },
  { label: "Registered Members", value: 12480 },
  { label: "Events", value: 96 },
  { label: "Countries", value: 42 },
];
