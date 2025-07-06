"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfettiButton } from "@/components/magicui/confetti";
import { toast } from 'sonner';

export default function UsernameForm({ onSubmitComplete }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrapeWithJSONP = async (username, maxComments = 250) => {
    return new Promise((resolve, reject) => {
      const comments = [];
      let after = null;
      let currentAttempts = 0;
      const maxAttempts = 25;

      const fetchData = () => {
        if (currentAttempts >= maxAttempts || comments.length >= maxComments) {
          resolve(comments);
          return;
        }

        currentAttempts++;

        const callbackName = `reddit_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const script = document.createElement('script');

        let url = `https://old.reddit.com/user/${username}/comments/.json?jsonp=${callbackName}&limit=100`;
        if (after) {
          url += `&after=${after}`;
        }

        const cleanup = () => {
          if (script.parentNode) {
            document.head.removeChild(script);
          }
          if (window[callbackName]) {
            delete window[callbackName];
          }
        };

        const timeoutId = setTimeout(() => {
          cleanup();
          console.log('Request timed out, trying next page...');
          setTimeout(fetchData, 1000);
        }, 10000);

        window[callbackName] = (data) => {
          clearTimeout(timeoutId);
          
          try {
            if (!data || !data.data || !data.data.children || !Array.isArray(data.data.children)) {
              console.log('Invalid response structure - user not found');
              reject(new Error('User not found'));
              return;
            }

            const children = data.data.children;

            if (children.length === 0) {
              console.log('No comments found');
              if (currentAttempts === 1 && comments.length === 0) {
                reject(new Error('User not found'));
                return;
              }
              resolve(comments);
              return;
            }

            let newCommentsCount = 0;
            for (const item of children) {
              const commentData = item.data;
              if (commentData.body && 
                  commentData.body !== '[deleted]' && 
                  commentData.body !== '[removed]' &&
                  commentData.body.trim() !== '') {

                const isDuplicate = comments.some(c => c.body === commentData.body);
                if (!isDuplicate) {
                  let extractedPath = '';
                  try {
                    const permalink = `https://reddit.com${commentData.permalink}`;
                    const match = permalink.match(/\/r\/([^\/]+\/comments\/[^\/]+\/[^\/]+)\//);
                    extractedPath = match ? match[1] : commentData.permalink;
                  } catch (error) {
                    extractedPath = commentData.permalink;
                  }

                  comments.push({
                    body: commentData.body,
                    upvotes: commentData.score,
                    permalink: extractedPath,
                  });
                  newCommentsCount++;
                }

                if (comments.length >= maxComments) {
                  resolve(comments);
                  return;
                }
              }
            }

            const newAfter = data?.data?.after;
            
            if (!newAfter || newAfter === after) {
              console.log('No more pages available');
              resolve(comments);
              return;
            }

            after = newAfter;

            if (newCommentsCount > 0) {
              console.log(`Fetched ${newCommentsCount} new comments, total: ${comments.length}`);
              setTimeout(fetchData, 500); // Rate limiting
            } else {
              console.log('No new comments found, stopping');
              resolve(comments);
            }

          } catch (error) {
            console.error('JSONP parsing error:', error);
            reject(new Error('User not found'));
          } finally {
            cleanup();
          }
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          cleanup();
          console.error('Script loading failed');
          reject(new Error('User not found'));
        };

        script.src = url;
        document.head.appendChild(script);
      };

      fetchData();
    });
  };

  const fetchUserProfile = async (username) => {
    return new Promise((resolve, reject) => {
      const callbackName = `reddit_profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const script = document.createElement('script');

      const cleanup = () => {
        if (script.parentNode) {
          document.head.removeChild(script);
        }
        if (window[callbackName]) {
          delete window[callbackName];
        }
      };

      const timeoutId = setTimeout(() => {
        cleanup();
        console.log('Profile fetch timed out');
        resolve({ name: null, avatar: null });
      }, 5000);

      window[callbackName] = (data) => {
        clearTimeout(timeoutId);
        
        try {
          if (data?.data?.subreddit) {
            const profile = data.data.subreddit;
            let avatar = profile.icon_img || profile.community_icon || null;
            
            // Check if avatar is from i.redd.it domain, otherwise use default
            if (avatar && !avatar.includes('i.redd.it')) {
              avatar = 'https://www.redditstatic.com/avatars/avatar_default_01_FF4500.png';
            }
            
            resolve({
              name: profile.display_name_prefixed || profile.display_name || null,
              avatar: avatar
            });
          } else {
            resolve({ name: null, avatar: null });
          }
        } catch (error) {
          console.error('Profile parsing error:', error);
          resolve({ name: null, avatar: null });
        } finally {
          cleanup();
        }
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        cleanup();
        console.error('Profile script loading failed');
        resolve({ name: null, avatar: null });
      };

      script.src = `https://old.reddit.com/user/${username}/about.json?jsonp=${callbackName}`;
      document.head.appendChild(script);
    });
  };

  const sendToAPI = async (comments, userProfile) => {
    try {
      const response = await fetch('https://api.goonchan.org/reddit/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          comments,
          username: userProfile.username,
          name: userProfile.name,
          avatar: userProfile.avatar,
        }),
      });

      if (!response.ok) {
        // If the response is not OK, try to parse the error message from the body
        const errorData = await response.json().catch(() => null); // Gracefully handle non-JSON responses
        const errorMessage = errorData?.message || `API request failed with status ${response.status}`;
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
        const [comments, userProfile] = await Promise.all([
          scrapeWithJSONP(username, 250),
          fetchUserProfile(username)
        ]);
        
        if (comments.length === 0) {
          toast.error('No comments found for this user');
          setIsLoading(false); // Reset loading state
          return;
        }

        onSubmitComplete?.();

        const profileData = {
          username: username,
          name: userProfile.name,
          avatar: userProfile.avatar
        };
        
        // Send to API and wait for the response
        const apiResponse = await sendToAPI(comments, profileData);

        if (apiResponse.success) {
          // Redirect on success
          window.location.href = `/roast?user=${encodeURIComponent(username)}`;
        } else {
          // Handle API-level errors (e.g., validation)
          toast.error(apiResponse.message || 'An unknown error occurred.');
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('Error during process:', error);
        toast.error(error.message || 'An unknown error occurred. Please try again.');
        setIsLoading(false);
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