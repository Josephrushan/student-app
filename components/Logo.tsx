import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  white?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", white = false, size = 'md' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Updated Firebase Storage URL with correct token
  const wordmarkUrl = "https://firebasestorage.googleapis.com/v0/b/websitey-9f8e4.firebasestorage.app/o/Educator.svg?alt=media&token=474dc685-fd5c-4475-b93a-b8d55c367d75";
  
  // Adjusted for "smaller on mobile" but using full logo
  const heightClasses = {
    sm: "h-[14px] md:h-[18px]",
    md: "h-[20px] md:h-[26px]",
    lg: "h-[32px] md:h-[48px]"
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Failed to load logo from Firebase Storage');
  };

  return (
    <div className={`flex items-center ${className}`}>
      {isLoading && !hasError && (
        <div className={`${heightClasses[size]} w-auto bg-slate-200 rounded animate-pulse`}></div>
      )}
      <img 
        src={wordmarkUrl} 
        alt="educater." 
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoading ? 'none' : 'block' }}
        className={`${heightClasses[size]} w-auto object-contain transition-all duration-300 ${white ? 'brightness-0 invert' : ''}`}
      />
      {hasError && (
        <div className={`${heightClasses[size]} w-auto flex items-center justify-center bg-slate-100 rounded text-xs font-bold text-slate-400`}>
          educater.
        </div>
      )}
    </div>
  );
};

export default Logo;