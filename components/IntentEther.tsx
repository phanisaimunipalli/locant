import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const intents = [
  "late night coffee 94103", "emergency plumber near me", "best vegan tacos", "coworking space with monitor", 
  "dog walker cheap", "yoga studio 7am", "gluten free bakery", "tesla charger", "notary public open now", 
  "tailor for suit", "kids swimming lessons", "24h pharmacy", "organic grocery delivery", "quiet study spot", 
  "roof repair urgent", "mobile car wash", "boxing gym", "jazz bar live music", "korean bbq", "vintage clothing store", 
  "pilates reformer", "urgent care wait time", "locksmith auto", "wedding florist", "dry cleaner eco friendly", 
  "hvac repair", "math tutor", "piano lessons", "meditation group", "running club", "farmers market sunday", 
  "craft beer brewery", "wine bar date night", "authentic italian pasta", "sushi omakase", "dim sum cart", 
  "ramen late night", "pho authentic", "tacos al pastor", "burrito breakfast", "coffee roaster", "matcha latte", 
  "chai tea", "bubble tea", "smoothie bowl", "acai bowl", "crossfit gym", "powerlifting gym", "rock climbing gym", 
  "spin class", "barre class", "dance studio", "pottery class", "painting class", "cooking class", "language exchange", 
  "book club", "board game cafe", "cat cafe", "dog park fenced", "hiking trail scenic", "beach sunset", 
  "park picnic", "playground toddler", "library quiet", "museum art", "gallery opening", "live theater", 
  "comedy club", "movie theater imax", "concert venue", "sports bar", "dive bar", "cocktail bar speakeasy", 
  "rooftop bar", "beer garden", "winery tasting", "brewery tour", "distillery tour", "food truck festival", 
  "night market", "antique shop", "thrift store", "boutique clothing", "sneaker shop", "record store", 
  "bookstore independent", "plant shop", "flower shop", "gift shop", "toy store", "pet shop", "hardware store", 
  "bike shop", "surf shop", "skate shop", "ski shop", "camping gear", "fishing gear", "hunting gear"
];

const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5);

interface IntentEtherProps {
  isBlurred: boolean;
}

const IntentEther: React.FC<IntentEtherProps> = ({ isBlurred }) => {
  const [columns, setColumns] = useState<string[][]>([]);

  useEffect(() => {
    // Generate distinct randomized columns for a rich data texture
    setColumns([
      shuffle(intents),
      shuffle(intents),
      shuffle(intents),
      shuffle(intents),
      shuffle(intents),
    ]);
  }, []);

  if (columns.length === 0) return null;

  return (
    <div 
      className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isBlurred ? 'blur-[8px] opacity-20 scale-105' : 'blur-[0.5px] opacity-100 scale-100'}
      `}
    >
      {/* Soft gradient masks to fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 z-10" />
      
      {/* Responsive Grid: 2 cols mobile, 3 tablet, 5 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 h-full w-full px-6 md:px-12 opacity-[0.12]">
        {columns.map((col, i) => (
          <Column 
            key={i} 
            intents={col} 
            duration={45 + (i * 8)} // Varied speeds
            reverse={i % 2 === 1}   // Alternating directions
            className={i >= 2 ? (i >= 3 ? 'hidden lg:flex' : 'hidden md:flex') : 'flex'} // Responsive visibility
          />
        ))}
      </div>
    </div>
  );
};

const Column: React.FC<{ intents: string[], duration: number, reverse?: boolean, className?: string }> = ({ intents, duration, reverse, className }) => {
  return (
    <div className={`flex-col gap-8 text-base md:text-xl font-mono whitespace-nowrap text-[#1D1D1F] select-none overflow-hidden h-full ${className}`}>
      <motion.div
        // Animate from 0% to -50% to create a seamless loop with the duplicated list
        animate={{ y: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ 
          repeat: Infinity, 
          duration: duration, 
          ease: "linear" 
        }}
        className="flex flex-col gap-8 will-change-transform"
      >
        {/* Original List */}
        {intents.map((intent, i) => (
          <span key={`a-${i}`} className="tracking-tight">{intent}</span>
        ))}
        {/* Duplicate List for Seamless Loop */}
        {intents.map((intent, i) => (
          <span key={`b-${i}`} className="tracking-tight">{intent}</span>
        ))}
      </motion.div>
    </div>
  );
};

export default IntentEther;