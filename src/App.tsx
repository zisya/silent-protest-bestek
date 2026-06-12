/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CreateProtest } from './components/CreateProtest';
import { ProtestList } from './components/ProtestList';
import { Marquee } from './components/Marquee';

export default function App() {
  const [adminMode, setAdminMode] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);

  const handleTitleClick = () => {
    const next = titleClicks + 1;
    if (next >= 5) {
      setTitleClicks(0);
      const password = window.prompt('Masukkan password admin');
      if (password === 'gatauakumah') {
        setAdminMode(true);
      }
      return;
    }
    setTitleClicks(next);
  };

  return (
    <div className="min-h-screen bg-brand-yellow text-black font-sans selection:bg-brand-pink selection:text-black flex flex-col overflow-x-clip">
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-6 lg:gap-8">
        <section className="flex flex-col gap-6 pb-20 lg:pb-0 px-2 sm:px-0 min-w-0">
          <header className="space-y-2 max-w-full">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter uppercase whitespace-pre-line break-word cursor-pointer"
              onClick={handleTitleClick}
            >
              SILENT{"\n"}PROTEST
            </h1>
            <p className="text-base sm:text-lg font-bold leading-tight max-w-full sm:max-w-sm break-word">
              Ada unek-unek selama di BESTEK? Tulis aja. Siapa tau ternyata satu UKM ngerasain hal yang sama.
            </p>
          </header>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <CreateProtest />
          </div>
        </section>

        <section className="flex flex-col gap-4 min-w-0 border-t-4 border-black lg:border-t-0 pt-8 lg:pt-0">
          <ProtestList adminMode={adminMode} />
        </section>
      </main>

      <Marquee text="Akhirnya ada tempat buat ngomong tanpa harus buka suara pas rapat • Akhirnya ada tempat buat ngomong tanpa harus buka suara pas rapat • " className="fixed bottom-0 left-0 w-full z-10 border-t-[4px] border-black" />
    </div>
  );
}
