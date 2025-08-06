'use client';

import React, { useState, useEffect } from 'react';
import config from '../../config.json';
import Footer from '@/components/Footer';

const parseQuestions = (rawQuestions) => {
  try {
    return JSON.parse(rawQuestions);
  } catch (e) {

    const jsonMatch = rawQuestions.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('Failed to parse extracted JSON:', err);
        return null;
      }
    }
  }
  return null;
};

export default function RoastPage() {
  const [roastData, setRoastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showRoastResults, setShowRoastResults] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [aiSummaries, setAiSummaries] = useState({
    detailedRoast: null,
    strengthAnalysis: null,
    weaknessAnalysis: null,
    loveLifeAnalysis: null,
    lifePurposeAnalysis: null
  });

  const [aiSummariesComplete, setAiSummariesComplete] = useState({
    detailedRoast: false,
    strengthAnalysis: false,
    weaknessAnalysis: false,
    loveLifeAnalysis: false,
    lifePurposeAnalysis: false
  });

  const reactionMessages = [
    "lol", "omg", "wait what", "hold up", "no way", "really?", "oh my...", 
    "yikes", "hmm", "okay then", "well well well", "oof"
  ];

  useEffect(() => {
    let intervalId = null;

    const initialFetch = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('user');

        if (!username) {
            setError('No username provided in URL');
            setLoading(false);
            return;
        }

        const handleSummaries = (summariesData) => {
            setUserData({
                username: summariesData.username,
                avatar: summariesData.avatar,
                subreddits: summariesData.subreddits,
            });

            setAiSummaries(prevSummaries => {
                const newSummaries = { ...prevSummaries };
                let hasChanged = false;
                Object.keys(newSummaries).forEach(key => {
                    if (summariesData.aiSummaries[key] && !prevSummaries[key]) {
                        newSummaries[key] = summariesData.aiSummaries[key];
                        hasChanged = true;
                    }
                });
                return hasChanged ? newSummaries : prevSummaries;
            });

            setAiSummariesComplete(prevComplete => {
                const newComplete = { ...prevComplete };
                let hasChanged = false;
                Object.keys(newComplete).forEach(key => {
                    const isComplete = !!summariesData.aiSummaries[key];
                    if (isComplete && !prevComplete[key]) {
                        newComplete[key] = true;
                        hasChanged = true;
                    }
                });
                return hasChanged ? newComplete : prevComplete;
            });

            return Object.values(summariesData.aiSummaries).every(summary => !!summary);
        };

        try {
            const response = await fetch(`${config.url}/api/roast/${encodeURIComponent(username)}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch roast data.');
            }

            if (data.type === 'questions') {
                const parsedQuestions = parseQuestions(data.data.questions);
                if (!parsedQuestions) throw new Error('Failed to parse roast questions.');
                
                setUserData({ username: data.data.username, avatar: data.data.avatar });
                setRoastData(parsedQuestions);
                setLoading(false);
                startChatSequence(parsedQuestions);
            } else if (data.type === 'summaries') {
                setShowRoastResults(true);
                setLoading(false);
                window.scrollTo(0, 0);

                const allComplete = handleSummaries(data.data);

                if (!allComplete) {
                    intervalId = setInterval(async () => {
                        try {
                            const pollResponse = await fetch(`${config.url}/api/roast/${encodeURIComponent(username)}`);
                            const pollData = await pollResponse.json();

                            if (pollData.success && pollData.type === 'summaries') {
                                if (handleSummaries(pollData.data)) {
                                    clearInterval(intervalId);
                                }
                            } else if (!pollData.success) {
                                clearInterval(intervalId);
                            }
                        } catch (pollErr) {
                            console.error('Polling error:', pollErr);
                            clearInterval(intervalId);
                        }
                    }, 1000);
                }
            }
        } catch (err) {
            console.error('Error fetching roast data:', err);
            setError(err.message || 'An unknown error occurred.');
            setLoading(false);
        }
    };

    initialFetch();

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (window.innerWidth >= 640) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  useEffect(() => {
    if (showRoastResults) {
      window.scrollTo(0, 0);
    }
  }, [showRoastResults]);

  const typeMessage = (message, isUser = false) => {
    return new Promise((resolve) => {
      const messageId = Date.now() + Math.random();

      setChatMessages(prev => [...prev, { 
        id: messageId, 
        text: '', 
        isUser, 
        isTyping: !isUser 
      }]);
      
      if (isUser) {
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, text: message, isTyping: false } : msg
          )
        );
        resolve();
      } else {
        setIsTyping(true);
        let currentText = '';
        let charIndex = 0;
        
        const typeChar = () => {
          if (charIndex < message.length) {
            currentText += message[charIndex];
            setChatMessages(prev => 
              prev.map(msg => 
                msg.id === messageId ? { ...msg, text: currentText } : msg
              )
            );
            charIndex++;

            const delay = Math.random() * 20 + 20;
            setTimeout(typeChar, delay);
          } else {
            setChatMessages(prev => 
              prev.map(msg => 
                msg.id === messageId ? { ...msg, isTyping: false } : msg
              )
            );
            setIsTyping(false);
            resolve();
          }
        };

        setTimeout(typeChar, 300);
      }
    });
  };

  const startChatSequence = async (questionsData) => {
    await typeMessage("First analyzing your Reddit footprint...", false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await typeMessage("I found some interesting stuff", false);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await typeMessage(reactionMessages[Math.floor(Math.random() * reactionMessages.length)], false);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await typeMessage(reactionMessages[Math.floor(Math.random() * reactionMessages.length)], false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (questionsData && questionsData.length > 0) {
      await typeMessage(questionsData[0].question, false);
      setShowButtons(true);
    }
  };

  const handleAnswer = async (answer) => {
    setShowButtons(false);

    await typeMessage(answer, true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentQ = roastData[currentQuestion];
    const response = answer === 'Yes' ? currentQ.yes_response : currentQ.no_response;

    await typeMessage(response, false);
    await new Promise(resolve => setTimeout(resolve, 800));

    const reaction = reactionMessages[Math.floor(Math.random() * reactionMessages.length)];
    await typeMessage(reaction, false);
    
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < roastData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await typeMessage(roastData[currentQuestion + 1].question, false);
      setShowButtons(true);
    } else {
      setIsComplete(true);
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('user');
      try {
        await fetch(`${config.url}/api/roast/${encodeURIComponent(username)}/seen`, { method: 'POST' });
      } catch (err) {
        console.error("Failed to mark questions as seen:", err);
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    
    setIsRegenerating(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('user');
      
      if (!username) {
        throw new Error('No username found');
      }

      const response = await fetch(`${config.url}/api/roast/${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete roast');
      }

      window.location.href = `/?regenerate=${encodeURIComponent(username)}`;
      
    } catch (error) {
      console.error('Error regenerating roast:', error);
      setIsRegenerating(false);
    }
  };

  const RoastCard = ({ title, content, emoji, isLoading, className = "" }) => (
    <div className={`bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-xs transition-all duration-300 ${className}`}>
      <div className="flex items-center space-x-2.5 mb-3">
        <span className="text-2xl">{emoji}</span>
        <h3 className="font-merri text-xl font-light text-black">{title}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      ) : (
        <p className="font-pop text-black/80 leading-relaxed">{content}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mx-auto mb-4"></div>
          <p className="font-mono text-sm text-black/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-merri text-2xl font-light text-black mb-4">Something went wrong</h1>
          <p className="font-pop text-black/60 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-black text-white px-6 py-3 rounded-lg font-pop font-medium cursor-pointer transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      {!showRoastResults && (
        <div className="relative">
          <div className="min-h-screen p-4">
            <div className="max-w-2xl mx-auto pt-8">
              <div className="space-y-6">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col">
                      <div
                        className={`max-w-sm px-4 py-3 rounded-2xl ${
                          message.isUser
                            ? 'bg-black text-white font-pop ml-auto'
                            : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-black font-pop shadow-sm'
                        }`}
                      >
                        {message.text}
                        {message.isTyping && (
                          <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                        )}
                      </div>
                      
                      {showButtons && !message.isUser && chatMessages.indexOf(message) === chatMessages.length - 1 && (
                        <div className="flex justify-end mt-4 space-x-3">
                          <button
                            onClick={() => handleAnswer('Yes')}
                            className="bg-[#2c2c2c] text-white px-5 py-2.5 rounded-2xl hover:bg-[#151515] font-pop font-medium cursor-pointer transition-all duration-300 ease-in-out"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => handleAnswer('No')}
                            className="bg-gray-200 text-black px-5 py-2.5 rounded-2xl font-pop font-medium cursor-pointer hover:bg-gray-300 transition-all duration-300 ease-in-out"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isComplete && (
                <div className="text-center mt-12 mb-10">
                  <div className="text-black/60 font-mono text-sm">
                    That's all! 🎉
                  </div>
                </div>
              )}

              <div className="text-center opacity-0 mt-24 mb-16">
                a
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoastResults && (
        <div className="min-h-screen py-8 px-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-merri text-4xl sm:text-5xl font-light text-black mb-2 tracking-tight">
                Your Roast
              </h1>
              <p className="font-pop text-black/60 text-lg">
                Here's what we found lurking in your Reddit history
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-black/70 hover:text-black transition-colors cursor-pointer group"
              >
                <svg 
                  className="w-4 h-4 transition-transform duration-250 group-hover:-translate-x-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-pop text-sm font-medium">Back to Home</span>
              </div>

              <div 
                onClick={handleRegenerate}
                className={`flex items-center space-x-2 transition-colors cursor-pointer group ${
                  isRegenerating 
                    ? 'text-black/40 cursor-not-allowed' 
                    : 'text-black/70 hover:text-black'
                }`}
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-400 ${
                    isRegenerating 
                      ? 'animate-spin' 
                      : 'group-hover:rotate-180'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-pop text-sm font-medium">
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">

                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                  {userData?.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                  )}
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h2 className="font-merri text-2xl sm:text-3xl font-light text-black mb-2">
                    {userData?.username ? `u/${userData.username}` : (
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mx-auto sm:mx-0"></div>
                    )}
                  </h2>

                  <div className="flex cursor-pointer flex-wrap justify-center sm:justify-start gap-2 mt-4">
                    {userData?.subreddits ? userData.subreddits.map((sub, index) => (
                      <span 
                        key={index}
                        onClick={() => window.open(`https://www.reddit.com/r/${userData?.subreddits[index].name}`, '_blank', 'noopener,noreferrer')} 
                        className="bg-black/5 text-black/70 hover:bg-black/6 transition-all duration-300 px-3 py-1 rounded-full text-sm font-pop"
                      >
                        r/{sub.name} ({sub.percentage}%)
                      </span>
                    )) : (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <RoastCard
                title="Roast"
                content={aiSummaries.detailedRoast}
                emoji="🔥"
                isLoading={!aiSummariesComplete.detailedRoast}
              />
            </div>

            <div className="columns-1 lg:columns-2 gap-6 space-y-6">
              <div className="break-inside-avoid mb-6">
                <RoastCard
                  title="Strengths"
                  content={aiSummaries.strengthAnalysis}
                  emoji="💪"
                  isLoading={!aiSummariesComplete.strengthAnalysis}
                />
              </div>

              <div className="break-inside-avoid mb-6">
                <RoastCard
                  title="Weaknesses"
                  content={aiSummaries.weaknessAnalysis}
                  emoji="🌙"
                  isLoading={!aiSummariesComplete.weaknessAnalysis}
                />
              </div>

              <div className="break-inside-avoid mb-6">
                <RoastCard
                  title="Love Life"
                  content={aiSummaries.loveLifeAnalysis}
                  emoji="🦋"
                  isLoading={!aiSummariesComplete.loveLifeAnalysis}
                />
              </div>

              <div className="break-inside-avoid mb-6">
                <RoastCard
                  title="Life Purpose"
                  content={aiSummaries.lifePurposeAnalysis}
                  emoji="🐺"
                  isLoading={!aiSummariesComplete.lifePurposeAnalysis}
                />
              </div>
            </div>

          </div>
          <div className='opacity-[97.5%] mt-14'>
            <Footer />
          </div>
        </div>
      )}
    </div>
  );
}

