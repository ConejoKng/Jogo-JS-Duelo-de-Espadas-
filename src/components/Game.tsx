import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import { Renderer } from '../game/renderer';
import { GameState, MapType } from '../types';
import { Trophy, RotateCcw, Play, Map as MapIcon } from 'lucide-react';
import ComicIntro from './ComicIntro';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStatus, setGameStatus] = useState<'START' | 'PLAYING' | 'PAUSED' | 'ROUND_END' | 'MATCH_END'>('START');
  const [winner, setWinner] = useState<number | null>(null);
  const [playerNames, setPlayerNames] = useState({ 1: 'Jogador 1', 2: 'Jogador 2' });
  const [selectedMap, setSelectedMap] = useState<MapType>(MapType.DOJO);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && (gameStatus === 'PLAYING' || gameStatus === 'PAUSED')) {
        setGameStatus(prev => prev === 'PLAYING' ? 'PAUSED' : 'PLAYING');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize engine and renderer only once
    if (!engineRef.current) {
      engineRef.current = new GameEngine();
    }
    if (!rendererRef.current) {
      rendererRef.current = new Renderer(ctx);
    }

    let animationFrameId: number;

    const loop = (time: number) => {
      if (engineRef.current && rendererRef.current && gameStatus === 'PLAYING') {
        engineRef.current.update(time);
        rendererRef.current.draw(engineRef.current.state);
        setGameState({ ...engineRef.current.state });

        if (!engineRef.current.state.roundActive) {
          if (engineRef.current.state.scores[1] >= 2 || engineRef.current.state.scores[2] >= 2) {
            setGameStatus('MATCH_END');
            setWinner(engineRef.current.state.scores[1] >= 2 ? 1 : 2);
          } else {
            setGameStatus('ROUND_END');
          }
        }
      } else if (rendererRef.current && engineRef.current) {
        rendererRef.current.draw(engineRef.current.state);
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStatus]);

  const startGame = () => {
    setShowIntro(true);
  };

  const startActualGame = () => {
    setShowIntro(false);
    if (engineRef.current) {
      engineRef.current.state = engineRef.current.initNewRound({ 1: 0, 2: 0 }, selectedMap);
      engineRef.current.state.players[0].name = playerNames[1];
      engineRef.current.state.players[1].name = playerNames[2];
    }
    setGameStatus('PLAYING');
  };

  const nextRound = () => {
    if (engineRef.current) {
      const currentScores = engineRef.current.state.scores;
      engineRef.current.state = engineRef.current.initNewRound(currentScores, selectedMap);
      engineRef.current.state.players[0].name = playerNames[1];
      engineRef.current.state.players[1].name = playerNames[2];
    }
    setGameStatus('PLAYING');
  };

  const restartMatch = () => {
    if (engineRef.current) {
      engineRef.current.state = engineRef.current.initNewRound({ 1: 0, 2: 0 }, selectedMap);
      engineRef.current.state.players[0].name = playerNames[1];
      engineRef.current.state.players[1].name = playerNames[2];
    }
    setWinner(null);
    setGameStatus('PLAYING');
  };

  const quitToMenu = () => {
    setGameStatus('START');
    setWinner(null);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Canvas Container */}
      <div className="relative border-8 border-slate-800 rounded-2xl shadow-2xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="max-w-full h-auto block"
        />

        {/* HUD - Moved inside relative container to stay aligned with game area */}
        {gameStatus !== 'START' && gameState && (
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
            {/* Player 1 Stats */}
            <div className="flex flex-col gap-1 w-72 bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-700 font-black text-lg italic truncate max-w-[150px]">{gameState.players[0].name}</span>
                <div className="flex gap-1">
                  {[...Array(2)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full border border-blue-800 ${i < gameState.scores[1] ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-slate-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="h-5 bg-slate-200 rounded-md overflow-hidden border border-slate-400 shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300" 
                  style={{ width: `${gameState.players[0].hp}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 uppercase">Vida</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-md overflow-hidden border border-slate-400 shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300" 
                  style={{ width: `${(gameState.players[0].stamina / 200) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-800 uppercase">Stamina</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-md overflow-hidden border border-slate-400 shadow-inner relative">
                <div 
                  className={`h-full transition-all duration-300 ${gameState.players[0].specialCharge >= 100 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-cyan-600'}`} 
                  style={{ width: `${gameState.players[0].specialCharge}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-800 uppercase">Especial</span>
              </div>
            </div>

            {/* Central Scoreboard */}
            <div className="flex flex-col items-center bg-slate-900 text-white px-8 py-2 rounded-b-2xl border-x-2 border-b-2 border-slate-700 shadow-2xl relative">
              <button 
                onClick={() => setGameStatus('PAUSED')}
                className="absolute -bottom-10 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-4 py-1 rounded-full border border-slate-600 pointer-events-auto transition-colors"
              >
                PAUSAR (ESC)
              </button>
              <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 mb-1">PLACAR</div>
              <div className="flex items-center gap-6">
                <span className="text-5xl font-mono font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">{gameState.scores[1]}</span>
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className="text-4xl font-mono font-bold text-white">
                    {Math.max(0, Math.ceil(gameState.roundTime))}
                  </div>
                </div>
                <span className="text-5xl font-mono font-black text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">{gameState.scores[2]}</span>
              </div>
            </div>

            {/* Player 2 Stats */}
            <div className="flex flex-col gap-1 w-72 bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm text-right">
              <div className="flex justify-between items-center mb-1">
                <div className="flex gap-1">
                  {[...Array(2)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full border border-red-800 ${i < gameState.scores[2] ? 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-red-700 font-black text-lg italic truncate max-w-[150px]">{gameState.players[1].name}</span>
              </div>
              <div className="h-5 bg-slate-200 rounded-md overflow-hidden border border-slate-400 shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-300 ml-auto" 
                  style={{ width: `${gameState.players[1].hp}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 uppercase">Vida</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-md overflow-hidden border border-slate-400 shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-l from-yellow-500 to-yellow-300 transition-all duration-300 ml-auto" 
                  style={{ width: `${(gameState.players[1].stamina / 200) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-800 uppercase">Stamina</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-md overflow-hidden border border-slate-400 shadow-inner relative">
                <div 
                  className={`h-full transition-all duration-300 ml-auto ${gameState.players[1].specialCharge >= 100 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-cyan-600'}`} 
                  style={{ width: `${gameState.players[1].specialCharge}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-800 uppercase">Especial</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlays */}
      {gameStatus === 'PAUSED' && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center z-40">
          <div className="bg-slate-800 p-10 rounded-3xl border-4 border-slate-700 text-center shadow-2xl w-80">
            <h2 className="text-4xl font-black text-white mb-8 italic tracking-wider">PAUSADO</h2>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setGameStatus('PLAYING')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Play fill="currentColor" size={20} /> CONTINUAR
              </button>
              <button 
                onClick={quitToMenu}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> SAIR PARA O MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {showIntro && (
        <ComicIntro 
          player1Name={playerNames[1]} 
          player2Name={playerNames[2]} 
          onComplete={startActualGame} 
        />
      )}

      {gameStatus === 'START' && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <h1 className="text-7xl font-black text-white mb-2 tracking-tighter italic">DUELO DE ESPADAS: O ÚLTIMO LATIDO</h1>
          <p className="text-slate-400 mb-12 text-lg uppercase tracking-[0.3em]">A Vingança de Totó</p>
          
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-blue-500/30">
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" /> JOGADOR 1
              </h3>
              <input 
                type="text" 
                value={playerNames[1]} 
                onChange={(e) => setPlayerNames({ ...playerNames, 1: e.target.value })}
                placeholder="Nome do Jogador 1"
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg mb-4 border border-slate-600 focus:border-blue-500 outline-none"
              />
              <ul className="text-slate-300 space-y-2 text-sm">
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">WASD</span> Mover / Pular / Agachar</li>
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">E</span> Atacar</li>
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">Q</span> Defender</li>
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">ESPAÇO</span> Especial</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-red-500/30">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" /> JOGADOR 2
              </h3>
              <input 
                type="text" 
                value={playerNames[2]} 
                onChange={(e) => setPlayerNames({ ...playerNames, 2: e.target.value })}
                placeholder="Nome do Jogador 2"
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg mb-4 border border-slate-600 focus:border-red-500 outline-none"
              />
              <ul className="text-slate-300 space-y-2 text-sm">
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">SETAS</span> Mover / Pular / Agachar</li>
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">L-CLICK</span> Atacar</li>
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">R-CLICK</span> Defender</li>
                <li><span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">SCROLL</span> Especial</li>
              </ul>
            </div>
          </div>

          <div className="mb-12 w-full max-w-2xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 justify-center">
              <MapIcon size={20} className="text-yellow-500" /> ESCOLHER MAPA
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { id: MapType.DOJO, name: 'Dojo', color: 'bg-amber-900', border: 'border-amber-600' },
                { id: MapType.NIGHT_CITY, name: 'Cidade', color: 'bg-slate-900', border: 'border-pink-500' },
                { id: MapType.FOREST, name: 'Floresta', color: 'bg-green-900', border: 'border-green-500' },
                { id: MapType.VOLCANO, name: 'Vulcão', color: 'bg-red-950', border: 'border-red-600' },
              ].map((map) => (
                <button
                  key={map.id}
                  onClick={() => setSelectedMap(map.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${selectedMap === map.id ? `${map.border} scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'border-slate-700 opacity-60 hover:opacity-100'}`}
                >
                  <div className={`w-full h-12 ${map.color} rounded-lg mb-2`} />
                  <span className="text-white text-xs font-bold uppercase tracking-widest">{map.name}</span>
                  {selectedMap === map.id && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 rounded-full p-1">
                      <Play size={12} fill="currentColor" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={startGame}
            className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xl rounded-full transition-all hover:scale-105 flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            <Play fill="currentColor" /> INICIAR DUELO
          </button>
        </div>
      )}

      {gameStatus === 'ROUND_END' && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <div className="bg-slate-800 p-12 rounded-3xl border-4 border-slate-700 text-center shadow-2xl">
            <h2 className="text-5xl font-black text-white mb-4 italic">
              {gameState?.winner === 1 ? `${playerNames[1]} VENCEU O ROUND!` : gameState?.winner === 2 ? `${playerNames[2]} VENCEU O ROUND!` : 'ROUND EMPATADO!'}
            </h2>
            <p className="text-slate-400 mb-8 text-xl">Placar Atual: {gameState?.scores[1]} - {gameState?.scores[2]}</p>
            <button 
              onClick={nextRound}
              className="px-10 py-4 bg-white text-slate-900 font-bold text-xl rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto"
            >
              PRÓXIMO ROUND
            </button>
          </div>
        </div>
      )}

      {gameStatus === 'MATCH_END' && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
          <Trophy size={100} className={winner === 1 ? 'text-blue-400 mb-6' : 'text-red-400 mb-6'} />
          <h2 className="text-7xl font-black text-white mb-2 italic">
            {winner === 1 ? playerNames[1] : playerNames[2]} É O CAMPEÃO!
          </h2>
          <p className="text-slate-400 mb-12 text-2xl">Placar Final: {gameState?.scores[1]} - {gameState?.scores[2]}</p>
          <button 
            onClick={restartMatch}
            className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xl rounded-full transition-all hover:scale-105 flex items-center gap-3"
          >
            <RotateCcw /> REVANCHE
          </button>
        </div>
      )}

      {/* Footer Controls Hint */}
      <div className="mt-8 text-slate-500 text-sm uppercase tracking-widest flex gap-8">
        <span>J1: WASD + Q/E</span>
        <div className="w-px h-4 bg-slate-800" />
        <span>J2: SETAS + MOUSE</span>
      </div>
    </div>
  );
};

export default Game;
