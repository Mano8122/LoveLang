import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function AnimatedBackground() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const generatedHearts: Heart[] = [];
    for (let i = 0; i < 15; i++) {
      generatedHearts.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        size: 20 + Math.random() * 30,
      });
    }
    setHearts(generatedHearts);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-lavender-400 to-rose-300 animate-gradient-shift" />

      <div className="absolute inset-0">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-up opacity-20"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.size}px`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/5 to-transparent animate-pulse-very-slow" />
    </div>
  );
}
