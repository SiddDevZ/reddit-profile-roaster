'use client';

import React, { useState, useCallback } from 'react';
import { Search, Download, ExternalLink, MessageSquare, Calendar, TrendingUp, User, AlertCircle } from 'lucide-react';

const RedditCommentScraper = () => {
  const [username, setUsername] = useState('spez');
  const [maxComments, setMaxComments] = useState(100);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showStatus = (message, type) => {
    if (type === 'error') {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  const scrapeWithJSONP = async (username, maxComments) => {
    return new Promise((resolve, reject) => {
      const comments = [];
      let after = null;
      let currentAttempts = 0;
      const maxAttempts = 50;

      const fetchData = () => {
        if (currentAttempts >= maxAttempts || comments.length >= maxComments) {
          resolve(comments);
          return;
        }

        currentAttempts++;
        setProgress((comments.length / maxComments) * 100);

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
            const children = data?.data?.children;

            if (!children || children.length === 0) {
              console.log('No more comments found');
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

                const isDuplicate = comments.some(c => c.id === commentData.id);
                if (!isDuplicate) {
                  comments.push({
                    id: commentData.id,
                    body: commentData.body,
                    subreddit: commentData.subreddit,
                    score: commentData.score,
                    created_utc: commentData.created_utc,
                    permalink: `https://reddit.com${commentData.permalink}`,
                    author: commentData.author,
                    method: 'jsonp'
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
              setTimeout(fetchData, 1000); // Rate limiting
            } else {
              console.log('No new comments found, stopping');
              resolve(comments);
            }

          } catch (error) {
            console.error('JSONP parsing error:', error);
            resolve(comments); // Return what we have so far
          } finally {
            cleanup();
          }
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          cleanup();
          console.error('Script loading failed, retrying...');
          setTimeout(fetchData, 2000);
        };

        script.src = url;
        document.head.appendChild(script);
      };

      fetchData();
    });
  };

  const scrapeComments = useCallback(async () => {
    if (!username.trim()) {
      showStatus('Please enter a username', 'error');
      return;
    }

    setLoading(true);
    setProgress(0);
    setComments([]);
    setError('');
    setSuccess('');

    try {
      showStatus('Starting comment scraping using JSONP...', 'loading');
      const comments = await scrapeWithJSONP(username, maxComments);
      
      setComments(comments);
      showStatus(`Successfully scraped ${comments.length} comments using JSONP method!`, 'success');
      
    } catch (error) {
      console.error('Scraping error:', error);
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [username, maxComments]);

  const exportComments = useCallback((format = 'json') => {
    if (comments.length === 0) {
      showStatus('No comments to export', 'error');
      return;
    }

    let dataStr, dataUri, fileName;
    
    if (format === 'json') {
      dataStr = JSON.stringify(comments, null, 2);
      dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      fileName = `reddit_comments_${username}_${new Date().toISOString().split('T')[0]}.json`;
    } else {
      const csvContent = [
        ['ID', 'Author', 'Subreddit', 'Score', 'Date', 'Comment', 'Permalink'],
        ...comments.map(comment => [
          comment.id,
          comment.author,
          comment.subreddit,
          comment.score,
          new Date(comment.created_utc * 1000).toLocaleDateString(),
          `"${comment.body.replace(/"/g, '""')}"`,
          comment.permalink
        ])
      ].map(row => row.join(',')).join('\n');
      
      dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      fileName = `reddit_comments_${username}_${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  }, [comments, username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Reddit Analysis Tool</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Reddit Comment Scraper
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Extract and analyze Reddit user comments using advanced JSONP scraping technology.
              Bypass CORS restrictions and get comprehensive comment data.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-300 text-sm font-medium">Client-Side JSONP Method</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Reddit Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && scrapeComments()}
                  placeholder="Enter username (without u/)"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <TrendingUp className="inline w-4 h-4 mr-2" />
                  Max Comments
                </label>
                <input
                  type="number"
                  value={maxComments}
                  onChange={(e) => setMaxComments(parseInt(e.target.value) || 100)}
                  onKeyPress={(e) => e.key === 'Enter' && scrapeComments()}
                  min="1"
                  max="2000"
                  placeholder="Maximum comments to scrape"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              onClick={scrapeComments}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scraping Comments...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  🔗 Scrape Comments with JSONP
                </>
              )}
            </button>

            {loading && (
              <div className="mt-4">
                <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Progress: {Math.round(progress)}% • Fetched: {comments.length} comments
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <span className="text-green-300">{success}</span>
            </div>
          )}

          {/* Results Section */}
          {comments.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
                  Results ({comments.length} comments)
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportComments('json')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                  <button
                    onClick={() => exportComments('csv')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment, index) => (
                  <div key={comment.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3 text-sm text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-purple-400">#{index + 1}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          r/{comment.subreddit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(comment.created_utc * 1000).toLocaleDateString()}
                        </span>
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                          JSONP
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {comment.score}
                        </span>
                        <a
                          href={comment.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {comment.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedditCommentScraper;