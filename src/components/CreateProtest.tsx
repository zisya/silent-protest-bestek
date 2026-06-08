import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PLACEHOLDERS = [
  "kabid 1 banyak ngatur...",
  "koor solid ga solid...",
  "ketum jarang dateng rapat...",
  "logistik afk...",
  "koor music jarang bikin latihan...",
  "orang yang kerja itu-itu aja...",
  "banyak yang telat dateng rapat...",
  "chat di grup gaada yang jawab...",
  "ibarat timothee chalamet...",
  "pas butuh orang semua ngilang..."
];

export function CreateProtest() {
  const [text, setText] = useState('');
  const [nickname, setNickname] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || text.length > 500) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'protests'), {
        text: text.trim(),
        nickname: nickname.trim() || 'Anonim',
        likes: 0,
        createdAt: serverTimestamp()
      });
      setText('');
      setNickname('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('Gagal ngirim, coba lagi deh.');
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
            <span className="text-xs font-bold text-gray-500 break-word">{text.length}/500</span>
          </div>

          <div className="relative h-48 border-4 border-black p-4 bg-gray-50 min-w-0">
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
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              className="w-full h-full bg-transparent outline-none font-bold resize-none relative z-10 break-word min-w-0"
              placeholder=""
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 border-4 border-black p-2 flex items-center gap-2 bg-white min-w-0">
              <span className="text-xs font-black uppercase text-gray-500 break-word">Alias:</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={50}
                placeholder="Anonim"
                className="bg-transparent outline-none font-bold w-full text-sm placeholder:text-gray-300 break-word min-w-0"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="neubrutal-btn bg-brand-pink text-black px-8 py-2 disabled:opacity-50 w-full sm:w-auto text-center break-word"
            >
              {isSubmitting ? '...' : 'Curhatin'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
