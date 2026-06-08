import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
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

export function ProtestList() {
  const [protests, setProtests] = useState<Protest[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load liked IDs from localStorage
    const saved = localStorage.getItem('bestek_liked_protests');
    if (saved) {
      try {
        setLikedIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse liked IDs');
      }
    }

    const q = query(collection(db, 'protests'), orderBy('likes', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Protest[];
      setProtests(data);
    }, (error) => {
      console.error('Error fetching protests:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;
    
    // Optimistic update for local UI
    const newLiked = new Set(likedIds).add(id);
    setLikedIds(newLiked);
    localStorage.setItem('bestek_liked_protests', JSON.stringify(Array.from(newLiked)));

    try {
      const docRef = doc(db, 'protests', id);
      await updateDoc(docRef, {
        likes: increment(1)
      });
    } catch (err) {
      console.error('Failed to like:', err);
      // Revert if failed
      newLiked.delete(id);
      setLikedIds(new Set(newLiked));
      localStorage.setItem('bestek_liked_protests', JSON.stringify(Array.from(newLiked)));
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex justify-between items-end mb-4 shrink-0 px-2 lg:px-0 lg:-ml-2">
        <div className="space-y-1">
          <h2 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tight">Yang Lagi Banyak Dirasain</h2>
          <p className="font-bold text-sm">Semakin banyak yang relate, semakin naik.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-48 h-full px-2 lg:px-4 pt-2 -mx-2 lg:-mx-4">
        {protests.map((protest, index) => {
          const isLiked = likedIds.has(protest.id);
          const colorClass = COLORS[index % COLORS.length];
          const rotateClass = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
          
          return (
            <motion.div 
              key={protest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "neubrutal-card p-5 flex flex-col justify-between",
                colorClass,
                rotateClass
              )}
            >
              <div className="flex justify-between items-start">
                <span className="text-4xl font-black opacity-30">#{index + 1}</span>
                <button
                  onClick={() => handleLike(protest.id)}
                  disabled={isLiked}
                  className="text-xl font-bold bg-white/50 px-2 py-1 border-[2px] border-black rounded hover:scale-105 active:scale-95 transition-transform"
                >
                  {isLiked ? '❤️🔥' : '❤️'} {protest.likes}
                </button>
              </div>

              <p className="text-xl font-bold py-4 leading-snug">
                "{protest.text}"
              </p>

              <div className="font-black uppercase text-xs tracking-wider opacity-80">
                — {protest.nickname}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
