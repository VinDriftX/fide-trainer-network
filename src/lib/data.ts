import type { TFunction } from "i18next";

export type TrainerLevel = {
  code: string;
  name: string;
  rating: string;
  description: string;
};

const LEVEL_CODES = ["DI", "NI", "FI", "FT", "FST"] as const;

export function getTrainerLevels(t: TFunction): TrainerLevel[] {
  return LEVEL_CODES.map((code) => ({
    code,
    name: t(`levels.${code}.name`),
    rating: t(`levels.${code}.rating`),
    description: t(`levels.${code}.description`),
  }));
}

export type Event = {
  id: string;
  country: string;
  countryKey: string;
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

const EVENT_BASE = [
  {
    id: "mm-01",
    countryKey: "Myanmar",
    flag: "🇲🇲",
    date: "15/08/2026",
    time: "09:00 MMT",
    trainers: ["GM Wesley So", "IM Aung Aung", "FT Nay Oo"],
    examDate: "22/08/2026",
    zoomLink: "https://zoom.us/j/98765432101",
    meetingId: "987 6543 2101",
    passcode: "FTNMM26",
  },
  {
    id: "us-01",
    countryKey: "United States",
    flag: "🇺🇸",
    date: "10/09/2026",
    time: "10:00 MMT",
    trainers: ["GM Fabiano Caruana", "IM Danny Rensch", "FT Sara Chen"],
    examDate: "17/09/2026",
    zoomLink: "https://zoom.us/j/12345678909",
    meetingId: "123 4567 8909",
    passcode: "FTNUS26",
  },
  {
    id: "in-01",
    countryKey: "India",
    flag: "🇮🇳",
    date: "20/10/2026",
    time: "11:30 MMT",
    trainers: ["GM Viswanathan Anand", "GM Vidit Gujrathi", "FT Priya Rao"],
    examDate: "27/10/2026",
    zoomLink: "https://zoom.us/j/55566677788",
    meetingId: "555 6667 7788",
    passcode: "FTNIN26",
  },
] as const;

export function getEvents(t: TFunction): Event[] {
  return EVENT_BASE.map((e) => ({
    ...e,
    trainers: [...e.trainers],
    country: t(`events.countries.${e.countryKey}`, { defaultValue: e.countryKey }),
    name: t(`events.list.${e.id}.name`),
    venue: t(`events.list.${e.id}.venue`),
    description: t(`events.list.${e.id}.description`),
  }));
}

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

const TRAINER_BASE = [
  { id: "t1", rating: 2680, initials: "WC", color: "from-emerald-500 to-teal-600" },
  { id: "t2", rating: 2410, initials: "PS", color: "from-amber-500 to-orange-600" },
  { id: "t3", rating: 2280, initials: "AK", color: "from-indigo-500 to-purple-600" },
] as const;

export function getTrainers(t: TFunction): Trainer[] {
  return TRAINER_BASE.map((tr) => ({
    ...tr,
    name: t(`trainers.list.${tr.id}.name`),
    country: t(`trainers.list.${tr.id}.country`),
    title: t(`trainers.list.${tr.id}.title`),
    bio: t(`trainers.list.${tr.id}.bio`),
    experience: t(`trainers.list.${tr.id}.experience`),
    expertise: t(`trainers.list.${tr.id}.expertise`, { returnObjects: true }) as string[],
    languages: t(`trainers.list.${tr.id}.languages`, { returnObjects: true }) as string[],
  }));
}

export type Product = {
  id: string;
  name: string;
  category: string;
  categoryKey: string;
  price: number;
  description: string;
  emoji: string;
};

export const PRODUCT_CATEGORY_KEYS = ["Chess Sets", "Chess Pieces", "Chess Boards", "Chess Accessories"] as const;

const PRODUCT_BASE = [
  { id: "s1", categoryKey: "Chess Sets", price: 130, emoji: "♛" },
  { id: "s2", categoryKey: "Chess Sets", price: 44, emoji: "♟" },
  { id: "s3", categoryKey: "Chess Sets", price: 1709, emoji: "♞" },
  { id: "s4", categoryKey: "Chess Sets", price: 15, emoji: "♜" },
  { id: "s5", categoryKey: "Chess Sets", price: 55, emoji: "♚" },
  { id: "p1", categoryKey: "Chess Pieces", price: 460, emoji: "♛" },
  { id: "p2", categoryKey: "Chess Pieces", price: 42, emoji: "♟" },
  { id: "p3", categoryKey: "Chess Pieces", price: 770, emoji: "♞" },
  { id: "p4", categoryKey: "Chess Pieces", price: 42, emoji: "♜" },
  { id: "p5", categoryKey: "Chess Pieces", price: 42, emoji: "♚" },
  { id: "b1", categoryKey: "Chess Boards", price: 409, emoji: "▦" },
  { id: "b2", categoryKey: "Chess Boards", price: 439, emoji: "▦" },
  { id: "b3", categoryKey: "Chess Boards", price: 800, emoji: "▦" },
  { id: "b4", categoryKey: "Chess Boards", price: 5, emoji: "▦" },
  { id: "b5", categoryKey: "Chess Boards", price: 25, emoji: "▦" },
  { id: "a1", categoryKey: "Chess Accessories", price: 130, emoji: "📦" },
  { id: "a2", categoryKey: "Chess Accessories", price: 554, emoji: "🎒" },
  { id: "a3", categoryKey: "Chess Accessories", price: 409, emoji: "⏱️" },
] as const;

export function getProducts(t: TFunction): Product[] {
  return PRODUCT_BASE.map((p) => ({
    ...p,
    category: t(`shop.categories.${p.categoryKey}`),
    name: t(`shop.products.${p.id}.name`),
    description: t(`shop.products.${p.id}.description`),
  }));
}

export function getProductCategories(t: TFunction) {
  return PRODUCT_CATEGORY_KEYS.map((key) => ({
    key,
    label: t(`shop.categories.${key}`),
  }));
}

export const STAT_KEYS = ["trainers", "members", "events", "countries"] as const;

export function getStats(t: TFunction) {
  return [
    { key: "trainers", label: t("stats.trainers"), value: 428 },
    { key: "members", label: t("stats.members"), value: 12480 },
    { key: "events", label: t("stats.events"), value: 96 },
    { key: "countries", label: t("stats.countries"), value: 42 },
  ];
}
