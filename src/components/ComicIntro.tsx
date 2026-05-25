import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, SkipForward, Sword } from 'lucide-react';

interface Panel {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

interface ComicIntroProps {
  onComplete: () => void;
  player1Name: string;
  player2Name: string;
}

const ComicIntro: React.FC<ComicIntroProps> = ({ onComplete, player1Name, player2Name }) => {
  const [currentPanel, setCurrentPanel] = useState(0);

  const panels: Panel[] = [
    {
      title: "UM DIA TRANQUILO",
      description: `${player1Name} estava aproveitando a tarde com seu melhor amigo, Totó.`,
      color: "bg-green-900/40",
      icon: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-10 left-1/4 w-12 h-20 bg-blue-500 rounded-t-lg" />
          <div className="absolute bottom-10 left-1/2 w-16 h-10 bg-amber-600 rounded-full">
            <div className="absolute -top-4 left-2 w-6 h-6 bg-amber-600 rounded-full" />
            <div className="absolute top-2 right-0 w-8 h-4 bg-amber-700 rounded-full" />
          </div>
          <div className="absolute top-1/4 left-1/2 text-4xl">☀️</div>
        </div>
      )
    },
    {
      title: "A SOMBRA SE APROXIMA",
      description: `De repente, ${player2Name} surge das sombras com intenções cruéis.`,
      color: "bg-slate-900/60",
      icon: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-10 left-1/4 w-12 h-20 bg-blue-500 rounded-t-lg opacity-50" />
          <div className="absolute bottom-10 right-1/4 w-12 h-20 bg-red-600 rounded-t-lg shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
          <div className="absolute bottom-24 right-1/3 w-20 h-2 bg-slate-300 rotate-45" />
        </div>
      )
    },
    {
      title: "UM ATO IMPERDOÁVEL",
      description: `Sem piedade, ${player2Name} desfere um golpe fatal contra o pobre Totó.`,
      color: "bg-red-950/60",
      icon: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-10 right-1/4 w-12 h-20 bg-red-600 rounded-t-lg" />
          <div className="absolute bottom-10 left-1/2 w-16 h-10 bg-amber-600/30 rounded-full rotate-12" />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-8xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">SLASH!</div>
          </motion.div>
        </div>
      )
    },
    {
      title: "O LUTO",
      description: `${player1Name} corre para socorrer seu amigo, mas já é tarde demais...`,
      color: "bg-blue-950/60",
      icon: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-10 left-1/3 w-20 h-12 bg-blue-500 rounded-lg rotate-90" />
          <div className="absolute bottom-10 left-1/2 w-16 h-10 bg-amber-600/20 rounded-full" />
          <div className="absolute top-1/3 left-1/2 text-4xl">💧</div>
        </div>
      )
    },
    {
      title: "A VINGANÇA",
      description: `A dor se transforma em fúria. ${player1Name} jura que a justiça será feita com aço!`,
      color: "bg-orange-950/60",
      icon: (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-32 bg-blue-600 rounded-t-2xl border-4 border-white shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          />
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-4 h-40 bg-slate-200 rounded-full border-2 border-slate-400" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-6xl">💢</div>
        </div>
      )
    }
  ];

  const nextPanel = () => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-4xl aspect-video relative overflow-hidden rounded-3xl border-8 border-white shadow-2xl bg-slate-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPanel}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`absolute inset-0 ${panels[currentPanel].color} flex flex-col`}
          >
            <div className="flex-1 relative">
              {panels[currentPanel].icon}
              
              <div className="absolute top-6 left-6 bg-white text-black px-6 py-2 font-black text-2xl skew-x-[-12deg] shadow-lg">
                {panels[currentPanel].title}
              </div>
            </div>

            <div className="h-1/3 bg-white p-8 flex flex-col justify-center">
              <p className="text-black text-2xl font-bold leading-tight italic">
                "{panels[currentPanel].description}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {panels.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${i === currentPanel ? 'w-8 bg-blue-500' : 'w-2 bg-slate-400'}`} 
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl flex items-center gap-2 transition-all"
        >
          <SkipForward size={20} /> PULAR HISTÓRIA
        </button>
        
        <button
          onClick={nextPanel}
          className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
        >
          {currentPanel === panels.length - 1 ? (
            <>VINGANÇA! <Sword size={24} /></>
          ) : (
            <>PRÓXIMO <ChevronRight size={24} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default ComicIntro;
