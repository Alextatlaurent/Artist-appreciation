import React, { useState } from 'react';
import { ArtSubmissionForm } from './components/ArtSubmissionForm';
import { Globe } from 'lucide-react';
import { Logo } from './components/ui/Logo';

const App: React.FC = () => {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const toggleLang = () => {
    setLang(prev => prev === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-white/20 selection:text-white">
      
      {/* Background Ambiance: Metallic & Subtle */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden">
          {/* Base metallic gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e] via-[#050505] to-[#0e0e0e]"></div>
          
          {/* Subtle Top-Right Light (Warm Silver/Orange hint) - BOOSTED OPACITY */}
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(255,159,10,0.35)_0%,rgba(0,0,0,0)_70%)] blur-[100px] animate-float"></div>
          
          {/* Subtle Bottom-Left Light (Cool Silver/Blue hint) - BOOSTED OPACITY */}
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(94,92,230,0.35)_0%,rgba(0,0,0,0)_70%)] blur-[100px] animate-float-delayed"></div>
          
          {/* Central floating glow for depth - BOOSTED */}
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_70%)] blur-[120px] animate-float-slow mix-blend-soft-light"></div>
          
          {/* Noise texture for brushed metal feel */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay"></div>
      </div>

      {/* Header Pro */}
      <header className="py-8 px-8 bg-transparent sticky top-0 z-50 w-full">
        <div className="w-full max-w-[1920px] mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-6">
                <div className="cursor-pointer group" onClick={() => window.location.reload()}>
                    {/* Logo Display - Utilisation du composant intégré */}
                    <div className="h-12 w-auto text-white opacity-90 group-hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <Logo className="h-full w-auto" />
                    </div>
                </div>

                {/* Language Toggle */}
                <button 
                  onClick={toggleLang}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-md group"
                >
                  <Globe className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                  <span className={`text-[10px] font-bold tracking-widest ${lang === 'fr' ? 'text-white' : 'text-gray-500'}`}>FR</span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className={`text-[10px] font-bold tracking-widest ${lang === 'en' ? 'text-white' : 'text-gray-500'}`}>EN</span>
                </button>
            </div>
            
            {/* Tagline style "pill" - Metallic */}
            <span className="hidden md:flex items-center space-x-3 border border-white/10 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all">
              <div className="flex space-x-1">
                 <div className="w-1 h-1 rounded-full bg-[#5E5CE6] opacity-80 shadow-[0_0_5px_#5E5CE6]"></div>
                 <div className="w-1 h-1 rounded-full bg-[#FF9F0A] opacity-80 shadow-[0_0_5px_#FF9F0A]"></div>
              </div>
              <span className="text-[10px] font-medium text-gray-300 uppercase tracking-[0.2em]">
                {lang === 'fr' ? "Dossier d'acquisition" : "Acquisition File"}
              </span>
            </span>
        </div>
      </header>

      {/* Main Content Widescreen */}
      <main className="flex-grow flex flex-col justify-center py-10 px-4 sm:px-8 lg:px-12 relative z-10 w-full max-w-[1920px] mx-auto">
        <div className="w-full">
           <ArtSubmissionForm lang={lang} />
        </div>
      </main>

      {/* Footer Minimaliste */}
      <footer className="py-12 text-center text-gray-500 text-[10px] relative z-10 border-t border-white/5 mt-auto bg-black/60 backdrop-blur-xl">
        <div className="w-full max-w-[1920px] mx-auto px-6">
           <p className="opacity-70 font-medium tracking-wide uppercase">© {new Date().getFullYear()} Le Salon des Inconnus. {lang === 'fr' ? "Document Confidentiel." : "Confidential Document."}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;