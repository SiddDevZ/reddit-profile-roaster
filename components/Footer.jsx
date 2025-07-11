"use client";

import React, { useState, useEffect } from 'react';

export default function Footer() {
  const [currentTime, setCurrentTime] = useState('');
  const [emojiIndex, setEmojiIndex] = useState(0);
  
  const emojis = ['🦄', '🚀', '💀', '🔥', '⚡', '🎯', '💻', '🌟', '⭐', '✨', '🎪', '🎭', '🎨', '🎲'];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(`${timeString.replace(',', '')}`);
    };

    const rotateEmoji = () => {
      setEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
    };

    updateTime();

    const timeInterval = setInterval(updateTime, 1000);
    const emojiInterval = setInterval(rotateEmoji, 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(emojiInterval);
    };
  }, []);

  return (
    <div className="absolute bottom-4 left-4 mb-3 sm:mb-0 right-4">
      <div className="hidden sm:flex justify-between items-center">
        <div className="bg-[#202020]  text-white text-sm font-mono px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-base">{emojis[emojiIndex]}</span>
            <span className="text-xs tracking-wider font-medium">
              2025 | A PROJECT BY{' '}
              <a 
                href="https://siddz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className=" transition-colors hover:text-blue-300 duration-200 cursor-pointer underline underline-offset-3"
              >
                SIDDHARTH
              </a>
            </span>
          </div>
        </div>
        
        <div className="bg-[#202020] text-white text-sm font-mono px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            ⏲️
            <span className="text-xs ml-2 tracking-wider font-medium">
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      <div className="sm:hidden flex border-t border-[#ffffff] flex-col items-center space-y-2 text-center">
        <div className="flex items-center space-x-2">
          <span className="text-base">{emojis[emojiIndex]}</span>
          <span className="text-xs text-black/80 font-mono tracking-wider font-semibold">
            2025 | A PROJECT BY{' '}
            <a 
              href="https://siddz.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer underline decoration-dotted underline-offset-2"
            >
              SIDDHARTH
            </a>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          ⏲️
          <span className="text-xs text-black/80 ml-2 font-mono tracking-wider font-semibold">
            {currentTime}
          </span>
        </div>
      </div>
    </div>
  );
}