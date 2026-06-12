import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Protest } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const COLORS = [
  'bg-brand-pink',
  'bg-brand-cyan',
  'bg-brand-green',
  'bg-brand-orange',
];

type SortMode = 'likes' | 'createdAt';

export function ProtestList({ adminMode }: { adminMode: boolean }) {
  const [protests, setProtests] = useState<Protest[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>('likes');
  const [expandedText, setExpandedText] = useState<Set<string>>(new Set());
  const [expandedSolution, setExpandedSolution] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('bestek_liked_protests');
    if (saved) {
      try {
        setLikedIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse liked IDs');
      }
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'protests'), orderBy(sortMode, 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Protest[];
        setProtests(data);
      },
      (error) => {
        console.error('Error fetching protests:', error);
      }
    );

    return () => unsubscribe();
  }, [sortMode]);

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;

    const newLiked = new Set(likedIds).add(id);
    setLikedIds(newLiked);
    localStorage.setItem('bestek_liked_protests', JSON.stringify(Array.from(newLiked)));

    try {
      const docRef = doc(db, 'protests', id);
      await updateDoc(docRef, { likes: increment(1) });
    } catch (err) {
      console.error('Failed to like:', err);
      newLiked.delete(id);
      setLikedIds(new Set(newLiked));
      localStorage.setItem('bestek_liked_protests', JSON.stringify(Array.from(newLiked)));
    }
  };

  const toggleText = (id: string) => {
    setExpandedText((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSolution = (id: string) => {
    setExpandedSolution((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin mau hapus keresahan ini?')) return;
    try {
      await deleteDoc(doc(db, 'protests', id));
    } catch (err) {
      console.error('Failed to delete protest:', err);
    }
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4 shrink-0 px-2 sm:px-0">
        <div className="space-y-1 max-w-full">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase italic tracking-tight break-word">Yang Lagi Banyak Dirasain</h2>
          <p className="font-bold text-sm break-word">Semakin banyak yang relate, semakin naik.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSortMode('likes')}
            className={cn(
              'neubrutal-btn px-4 py-2 text-sm',
              sortMode === 'likes' ? 'bg-black text-white' : 'bg-white text-black'
            )}
          >
            🔥 Paling Relate
          </button>
          <button
            type="button"
            onClick={() => setSortMode('createdAt')}
            className={cn(
              'neubrutal-btn px-4 py-2 text-sm',
              sortMode === 'createdAt' ? 'bg-black text-white' : 'bg-white text-black'
            )}
          >
            🕒 Terbaru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-6 pb-48 px-2 lg:px-4 pt-2">
        {protests.map((protest, index) => {
          const isLiked = likedIds.has(protest.id);
          const colorClass = COLORS[index % COLORS.length];
          const rotateClass = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
          const text = protest.text || '';
          const solution = protest.solution || '';
          const textExpanded = expandedText.has(protest.id);
          const solutionExpanded = expandedSolution.has(protest.id);
          const textNeedsToggle = text.length > 500;
          const solutionNeedsToggle = solution.length > 500;

          return (
            <motion.div
              key={protest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'neubrutal-card p-5 flex flex-col min-w-0 w-full self-start',
                colorClass,
                rotateClass
              )}
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <span className="text-4xl sm:text-5xl font-black opacity-30 break-word">#{index + 1}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLike(protest.id)}
                    disabled={isLiked}
                    className="text-xl font-bold bg-white/50 px-2 py-1 border-[2px] border-black rounded hover:scale-105 active:scale-95 transition-transform break-word whitespace-nowrap"
                  >
                    {isLiked ? '❤️🔥' : '❤️'} {protest.likes}
                  </button>
                  {adminMode && (
                    <button
                      type="button"
                      onClick={() => handleDelete(protest.id)}
                      className="text-sm font-black uppercase bg-white px-3 py-1 border-[2px] border-black rounded hover:bg-black hover:text-white transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xl sm:text-2xl font-bold leading-snug break-word">
                  "{textExpanded || !textNeedsToggle ? text : `${text.slice(0, 500)}...`}"
                </p>
                {textNeedsToggle && (
                  <button
                    type="button"
                    onClick={() => toggleText(protest.id)}
                    className="mt-3 neubrutal-btn bg-white text-black px-4 py-2 text-sm"
                  >
                    {textExpanded ? 'Tutup' : 'Lihat Selengkapnya'}
                  </button>
                )}
              </div>

              {solution && (
                <div className="mt-4">
                  <div className="font-black uppercase text-xs tracking-wider opacity-80 mb-2 break-word">Solusi</div>
                  <p className="text-base leading-snug break-word">
                    "{solutionExpanded || !solutionNeedsToggle ? solution : `${solution.slice(0, 500)}...`}"
                  </p>
                  {solutionNeedsToggle && (
                    <button
                      type="button"
                      onClick={() => toggleSolution(protest.id)}
                      className="mt-3 neubrutal-btn bg-white text-black px-4 py-2 text-sm"
                    >
                      {solutionExpanded ? 'Tutup' : 'Lihat Selengkapnya'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
