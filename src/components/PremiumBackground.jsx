import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// SVG de um brilho elegante (estrela premium)
const SparkleIcon = ({ size, color }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 0C12 0 12 10 24 12C24 12 14 12 12 24C12 24 12 14 0 12C0 12 10 12 12 0Z" 
      fill={color} 
    />
  </svg>
);

const PremiumBackground = () => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Cores premium harmonizando com a paleta
    const cores = ['#CB8461', '#A4B096', '#6E775D', '#D2B48C'];
    
    // Gerar 25 pontos de brilho aleatórios
    const gerados = Array.from({ length: 25 }).map((_, i) => {
      return {
        id: i,
        // Posição na tela
        x: Math.random() * 100, 
        y: Math.random() * 100,
        // Tamanho variado
        size: 8 + Math.random() * 20, 
        // Cor aleatória da paleta
        color: cores[Math.floor(Math.random() * cores.length)],
        // Duração da pulsação diferente para cada um (entre 3s e 8s)
        duration: 3 + Math.random() * 5,
        // Atraso para que não pisquem juntos
        delay: Math.random() * 5
      };
    });
    setSparkles(gerados);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0.1, 0.6, 0.1], 
            scale: [0.8, 1.2, 0.8] 
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: sparkle.delay
          }}
        >
          <SparkleIcon size={sparkle.size} color={sparkle.color} />
        </motion.div>
      ))}
    </div>
  );
};

export default PremiumBackground;
