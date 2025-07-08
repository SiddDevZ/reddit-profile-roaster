"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfettiButton } from "@/components/magicui/confetti";
import { toast } from 'sonner';
import config from '../config.json';

export default function UsernameForm({ onSubmitComplete }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendToAPI = async (username) => {
    try {
      const response = await fetch(`${config.url}/api/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `API request failed with status ${response.status}`;

        if (response.status === 404 && errorMessage.includes('User not found')) {
          throw new Error('USER_NOT_FOUND');
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      setIsLoading(true);
      
      try {
        setTimeout(() => {
          onSubmitComplete?.();
        }, 2500);

        const apiResponse = await sendToAPI(username.trim());

        if (apiResponse.success) {
          setTimeout(() => {
            if (apiResponse.redirect) {
              window.location.href = `/roast?user=${encodeURIComponent(apiResponse.username)}`;
            } else {
              window.location.href = `/roast?user=${encodeURIComponent(username.trim())}`;
            }
          }, 100);

          setTimeout(() => {
            setUsername('');
            setIsLoading(false);
            window.dispatchEvent(new CustomEvent('resetHomepage'));
          }, 1000);
        } else {
          toast.error(apiResponse.message || 'An unknown error occurred.');
          setIsLoading(false);
          window.dispatchEvent(new CustomEvent('roastError'));
        }
        
      } catch (error) {
        console.error('Error during process:', error);

        if (error.message === 'USER_NOT_FOUND') {
          toast.error('User not found. Please try with a different username.');
        } else {
          toast.error(error.message || 'An unknown error occurred. Please try again.');
        }
        
        setIsLoading(false);
        window.dispatchEvent(new CustomEvent('roastError'));
      }
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
              disabled={isLoading}
              className="w-full bg-white/50 outline-none text-lg sm:text-xl font-pop text-black placeholder-black/50 py-3 sm:py-[11px] pl-[2.33rem] sm:pl-12 pr-4 sm:pr-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <ConfettiButton
            type="submit"
            disabled={!username.trim() || isLoading}
            className="bg-[#272727] text-white backdrop-blur-3xl cursor-pointer font-pop font-medium text-lg sm:text-lg py-3 sm:py-[11px] px-6 sm:px-7 h-full rounded-lg transition-all duration-200 hover:bg-black/90 disabled:bg-black/70 disabled:opacity-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md whitespace-nowrap flex items-center justify-center gap-2"
            options={{
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>{t('usernameForm.loading')}</span>
              </>
            ) : (
              <>
                {t('usernameForm.button')} 🎉
              </>
            )}
          </ConfettiButton>
        </div>
      </form>
    </div>
  );
}