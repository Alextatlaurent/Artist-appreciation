import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  caption?: React.ReactNode;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, caption, className = '', ...props }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2 ml-1">
        <label className="block text-sm font-medium text-gray-300 tracking-wide">
            {label}
        </label>
        {caption && <div className="text-xs text-gray-400 font-medium">{caption}</div>}
      </div>
      <textarea
        className={`
          w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white
          placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20
          transition-all duration-300 text-lg font-medium resize-none leading-relaxed backdrop-blur-md
          hover:bg-white/[0.07]
          ${error ? 'bg-red-900/10 border-red-500/30' : ''}
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