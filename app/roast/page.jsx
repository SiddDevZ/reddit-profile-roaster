'use client';

import React, { useState, useEffect } from 'react';

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

  const reactionMessages = [
    "lol",
    "omg",
    "wait what",
    "hold up",
    "no way",
    "really?",
    "oh my...",
    "yikes",
    "hmm",
    "that's kinda sus..",
    "okay then",
    "well well well",
    "oof"
  ];

  useEffect(() => {
    const storedRoastData = localStorage.getItem('roastData');
    const storedError = localStorage.getItem('roastError');
    
    if (storedRoastData) {
      try {
        const parsedData = JSON.parse(storedRoastData);
        
        let questionsData;
        if (typeof parsedData.message === 'string') {
          try {
            let jsonString = parsedData.message.trim();
            const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              jsonString = jsonMatch[0];
            }
            jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            questionsData = JSON.parse(jsonString);
            
            if (!Array.isArray(questionsData) || questionsData.length === 0) {
              throw new Error('Invalid questions format');
            }
            
            for (const question of questionsData) {
              if (!question.question || !question.yes_response || !question.no_response) {
                throw new Error('Missing required question fields');
              }
            }
            
          } catch (parseError) {
            console.error('Failed to parse questions JSON:', parseError);
            setError('Failed to parse roast questions. The AI response may be malformed.');
            setLoading(false);
            return;
          }
        } else {
          questionsData = parsedData.message;
        }
        
        setRoastData(questionsData);
//         localStorage.removeItem('roastData');
        
        setTimeout(() => {
          startChatSequence(questionsData);
        }, 100);
        
      } catch (err) {
        console.error('Parse error:', err);
        setError('Failed to parse roast data');
      }
    } else if (storedError) {
      setError(storedError);
    //   localStorage.removeItem('roastError');
    } else {
      setError('No roast data found');
    }
    
    setLoading(false);
  }, []);

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

  useEffect(() => {
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    };
    
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

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
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
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
                
                {/* Yes/No buttons positioned where user response goes */}
                {showButtons && !message.isUser && chatMessages.indexOf(message) === chatMessages.length - 1 && (
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      onClick={() => handleAnswer('Yes')}
                      className="bg-black text-white px-6 py-3 rounded-2xl font-pop font-medium hover:bg-gray-800 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer('No')}
                      className="bg-gray-200 text-black px-6 py-3 rounded-2xl font-pop font-medium hover:bg-gray-300 transition-colors"
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
          <div className="text-center mt-12">
            <div className="text-black/60 font-mono text-sm">
              That's all! 🎉
            </div>
          </div>
        )}

        <div className="text-center mt-12 mb-8">
          <p className="font-mono text-xs text-black/40">
            Based on your Reddit activity
          </p>
        </div>
      </div>
    </div>
  );
}
