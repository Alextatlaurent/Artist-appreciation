import React, { useState } from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  const [hasError, setHasError] = useState(false);

  // Lien direct vers l'image Imgur (ID extrait: B1YfPqn)
  const logoUrl = "https://i.imgur.com/B1YfPqn.png";

  // Si l'image ne charge pas, on affiche un texte de repli propre
  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center font-bold uppercase tracking-widest whitespace-nowrap`} style={{ color: 'inherit' }}>
        Salon des Inconnus
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt="Logo Salon des Inconnus" 
      className={`${className} object-contain`}
      onError={() => setHasError(true)}
    />
  );
};