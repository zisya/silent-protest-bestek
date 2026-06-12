import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PLACEHOLDERS = [
  'kabid 1 banyak ngatur...',
  'koor solid ga solid...',
  'ketum jarang dateng rapat...',
  'logistik afk...',
  'koor music jarang bikin latihan...',
  'orang yang kerja itu-itu aja...',
  'banyak yang telat dateng rapat...',
  'chat di grup gaada yang jawab...',
  'ibarat timothee chalamet...',
  'wakil kesek banyak cakap',
  'koor grafis toxic...',
  'pas butuh orang semua ngilang...'
];

const STORAGE_KEY = 'silentprotest_submissions';
const MAX_LENGTH = 2000;
const DAILY_LIMIT = 3;
const COOLDOWN_MS = 5 * 60 * 1000;

function loadSubmissionHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [] as number[];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [] as number[];
  }
}

function saveSubmissionHistory(history: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function todayKey(timestamp: number) {
  return new Date(timestamp).toLocaleDateString();
}

function todaySubmissions(history: number[]) {
  const today = todayKey(Date.now());
  return history.filter((timestamp) => todayKey(timestamp) === today);
}

function getCooldownRemaining(latest: number) {
  const remaining = COOLDOWN_MS - (Date.now() - latest);
  return remaining > 0 ? remaining : 0;
}

export function CreateProtest() {
  const [text, setText] = useState('');
  const [solution, setSolution] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev: number) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedText = text.trim();
    const trimmedSolution = solution.trim();
    if (!trimmedText || trimmedText.length > MAX_LENGTH || trimmedSolution.length > MAX_LENGTH) return;

    const history = loadSubmissionHistory();
    const today = todaySubmissions(history);
    if (today.length >= DAILY_LIMIT) {
      setStatusMessage('Jatah curhat hari ini udah habis. Besok lagi ya.');
      return;
    }

    const latest = history.length ? Math.max(...history) : 0;
    const cooldown = getCooldownRemaining(latest);
    if (cooldown > 0) {
      setStatusMessage(`Tunggu ${Math.ceil(cooldown / 60000)} menit dulu sebelum curhat lagi.`);
      return;
    }

    setStatusMessage('');
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'protests'), {
        text: trimmedText,
        solution: trimmedSolution,
        likes: 0,
        createdAt: serverTimestamp()
      });

      const nextHistory = [...history, Date.now()];
      saveSubmissionHistory(nextHistory);

      setText('');
      setSolution('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit:', err);
      setStatusMessage('Gagal ngirim, coba lagi deh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full">
      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="neubrutal-card bg-brand-green p-6 text-xl font-bold uppercase mb-8 break-word"
        >
          Siap. Keresahanmu sekarang jadi konsumsi publik.
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="neubrutal-card bg-white p-6 flex flex-col gap-4 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <label className="font-black uppercase text-sm break-word">Tulis keresahan selama di BESTEK</label>
            <span className="text-xs font-bold text-gray-500 break-word">{text.length}/{MAX_LENGTH}</span>
          </div>

          <div className="relative h-52 border-4 border-black p-4 bg-gray-50 min-w-0">
            <AnimatePresence mode="wait">
              {!text && (
                <motion.div
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-4 left-4 right-4 text-gray-400 font-bold italic pointer-events-none break-word"
                >
                  "{PLACEHOLDERS[placeholderIndex]}"
                </motion.div>
              )}
            </AnimatePresence>
            <textarea
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              maxLength={MAX_LENGTH}
              className="w-full h-full bg-transparent outline-none font-bold resize-none relative z-10 break-word min-w-0"
              placeholder=""
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <label className="font-black uppercase text-sm break-word">Solusi yang kepikiran? (opsional)</label>
            <span className="text-xs font-bold text-gray-500 break-word">{solution.length}/{MAX_LENGTH}</span>
          </div>

          <div className="relative h-40 border-4 border-black p-4 bg-gray-50 min-w-0">
            <textarea
              value={solution}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSolution(e.target.value)}
              maxLength={MAX_LENGTH}
              className="w-full h-full bg-transparent outline-none font-bold resize-none relative z-10 break-word min-w-0"
              placeholder=""
            />
          </div>

          {statusMessage && (
            <div className="text-sm font-bold text-black bg-black/5 border-2 border-black p-3 rounded break-word">
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="neubrutal-btn bg-brand-pink text-black px-8 py-2 disabled:opacity-50 w-full text-center break-word"
          >
            {isSubmitting ? '...' : 'Curhatin'}
          </button>
        </form>
      )}
    </div>
  );
}
