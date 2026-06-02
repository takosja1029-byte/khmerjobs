import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getCompanyLogo, getClearbitLogo } from '@/src/lib/utils';

const initialCompanies = [
  { name: 'ABA Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/ABA_Bank_Logo.svg/512px-ABA_Bank_Logo.svg.png' },
  { name: 'Grab', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Grab_logo.svg/512px-Grab_logo.svg.png' },
  { name: 'Prudential', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Prudential_PLC_logo.svg/512px-Prudential_PLC_logo.svg.png' },
  { name: 'Coca-Cola', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/512px-Coca-Cola_logo.svg.png' },
  { name: 'Unilever', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Unilever.svg/512px-Unilever.svg.png' },
  { name: 'Heineken', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Heineken_logo.svg/512px-Heineken_logo.svg.png' },
  { name: 'DHL', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/DHL_Logo.svg/512px-DHL_Logo.svg.png' },
  { name: 'Nestle', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nestl%C3%A9_logo.svg/512px-Nestl%C3%A9_logo.svg.png' },
  { name: 'Manulife', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Manulife_logo.svg/512px-Manulife_logo.svg.png' },
  { name: 'Smart Axiata', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Smart_Axiata_Logo.svg/512px-Smart_Axiata_Logo.svg.png' },
  { name: 'Cellcard', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Cellcard_logo.png/512px-Cellcard_logo.png' },
  { name: 'Wing Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Wing_Bank_Logo_2021.svg/512px-Wing_Bank_Logo_2021.svg.png' },
  { name: 'PPCBank', logo: 'https://www.ppcbank.com.kh/wp-content/themes/ppcb/assets/images/logo.png' },
];

export default function LogoMarquee() {
  const [logoLevels, setLogoLevels] = useState<Record<string, number>>({});

  const handleImageError = (name: string, companyLogo?: string) => {
    const currentLevel = logoLevels[name] || 0;
    const clearbitUrl = getClearbitLogo(name);
    
    setLogoLevels(prev => {
      const level = prev[name] || 0;
      if (level >= 3) return prev;
      
      const currentUrl = getCompanyLogo(name, companyLogo, level);
      
      // If we are at level 0 and it already fell back to clearbit, skip level 1 and go to level 2
      if (level === 0 && currentUrl === clearbitUrl) {
        return { ...prev, [name]: 2 };
      }
      
      return { ...prev, [name]: level + 1 };
    });
  };

  return (
    <div className="py-12 bg-surface border-y border-slate-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center">
          Empowering recruitment for industry leaders
        </p>
      </div>
      
      <div className="relative flex overflow-hidden">
        <motion.div 
          className="flex flex-nowrap gap-20 items-center py-4"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {/* Duplicate for seamless infinite loop */}
          {[...initialCompanies, ...initialCompanies].map((company, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-[1.04] transition-all duration-300 cursor-pointer px-4 group"
            >
              <img 
                src={getCompanyLogo(company.name, (company as any).logo, logoLevels[company.name] || 0)} 
                alt={company.name} 
                className="h-7 w-auto object-contain pointer-events-none filter group-hover:brightness-105 dark:invert dark:opacity-80"
                onError={() => handleImageError(company.name, (company as any).logo)}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </motion.div>

        {/* Gradients for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface via-surface/80 to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  );
}
