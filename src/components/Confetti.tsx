import { useEffect, useState } from 'react';

export default function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const colors = ['#FF8BA7','#84D8D0','#A78BFA','#F9C74F','#F9844A','#F984E5','#43B97F'];
    const newPieces = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.3,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 1500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.x + '%',
            bottom: '40%',
            backgroundColor: p.color,
            animationDelay: p.delay + 's',
          }}
        />
      ))}
    </div>
  );
}
