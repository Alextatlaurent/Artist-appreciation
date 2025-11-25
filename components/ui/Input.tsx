import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2 ml-1 tracking-wide">
        {label}
      </label>
      <input
        className={`
          w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white
          placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20
          transition-all duration-300 text-lg font-medium backdrop-blur-md
          hover:bg-white/[0.07]
          ${error ? 'bg-red-900/10 border-red-500/30 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 ml-1 text-xs font-medium text-red-400 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};