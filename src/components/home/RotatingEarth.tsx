import { useEffect, useState } from 'react'

export function RotatingEarth() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 0.05) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Background Image with slow zoom/pan effect */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
        style={{ 
          backgroundImage: 'url("/stunning-earth.jpg")',
          transform: `scale(${1.1 + Math.sin(offset / 10) * 0.05})`,
          opacity: 0.8
        }}
      />
      
      {/* Animated Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      
      {/* Subtle floating particles/stars effect using CSS */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20 animate-pulse"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>
    </div>
  )
}
