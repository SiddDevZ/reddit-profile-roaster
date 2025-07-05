"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfettiButton } from "@/components/magicui/confetti";

export default function UsernameForm() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {

      console.log('Roasting user:', username);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto px-2 sm:px-0 sm:h-[52px]">
          <div className="flex-1 border-[#626262] border-2 backdrop-blur-3xl rounded-sm relative hover:border-[#3c3c3c] focus-within:border-[#0a0a0a] transition-all duration-300 ease-in-out h-full">
            <span className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-base sm:text-lg font-pop text-black/60 pointer-events-none">
              u/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('usernameForm.placeholder')}
              className="w-full bg-white/50 outline-none text-lg sm:text-xl font-pop text-black placeholder-black/50  py-3 sm:py-[11px] pl-[2.33rem] sm:pl-12 pr-4 sm:pr-6 rounded-lg transition-all duration-200"
            />
          </div>
          <ConfettiButton
            type="submit"
            disabled={!username.trim()}
            className="bg-[#272727] text-white backdrop-blur-3xl cursor-pointer font-pop font-medium text-lg sm:text-lg py-3 sm:py-[11px] px-6 sm:px-7 h-full rounded-lg transition-all duration-200 hover:bg-black/90 disabled:bg-black/70 disabled:opacity-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md whitespace-nowrap"
            options={{
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            }}
          >
            {t('usernameForm.button')} 🎉
          </ConfettiButton>
        </div>
      </form>
    </div>
  );
}