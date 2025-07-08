import { Hono } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'
import Roast from '../models/Roast.js'

const router = new Hono()

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.ip,
})

async function getGeminiResponse(prompt, retryCount = 0, useProModel = false) {
  const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9
  ].filter(Boolean)
  const shuffledKeys = [...API_KEYS].sort(() => Math.random() - 0.5)
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  }
  
  const headers = {
    "Content-Type": "application/json"
  }
  
  const modelName = useProModel ? "gemini-2.5-pro" : "gemini-2.5-flash"
  
  for (let i = 0; i < shuffledKeys.length; i++) {
    const apiKey = shuffledKeys[i]
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.candidates[0].content.parts[0].text
      } else {
        console.error(`API Key ${i + 1} failed with status:`, response.status)
        if (i === shuffledKeys.length - 1) {
          throw new Error(`All API keys failed. Last error: ${response.status}`)
        }
      }
    } catch (error) {
      console.error(`Error with API Key ${i + 1}:`, error.message)
      if (i === shuffledKeys.length - 1) {
        throw error
      }
    }
  }
}

function extractSubreddits(comments) {
  const subredditCounts = {}
  
  comments.forEach(comment => {
    if (comment.permalink) {
      const subreddit = comment.permalink.split('/')[0]
      if (subreddit) {
        subredditCounts[subreddit] = (subredditCounts[subreddit] || 0) + 1
      }
    }
  })
  
  const subredditArray = Object.entries(subredditCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / comments.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  
  return subredditArray.map(({ name, percentage }) => ({ name, percentage }))
}

async function generateRoastQuestions(comments, username) {
  const recentComments = comments.slice(0, 100);
  const roastPrompt = `Based on the Reddit posts and comments below, generate exactly two playful or sarcastic yes/no questions about the user's behavior or interests. Each question should come with a separate response for both "yes" and "no" answers.

Make the questions witty, judgmental, or sarcastic like a roasting friend would ask in genz style but don't overdo it. Focus on their behavior, posting style, subreddit choices, recurring phrases, or obvious patterns in their activity. It should be short like a normal message, Keep it entertaining.

Return the result as a JSON array of two objects with exactly these keys:
- question: the question text
- yes_response: the response if the user answers "yes"  
- no_response: the response if the user answers "no"

Example structure (match this format EXACTLY, not even a single character more or less nothing else other than values in it, don't even add the \`\`\`json and \`\`\` at the start and end):
[
{
"question": "",
"yes_response": "",
"no_response": ""
},
{
"question": "",
"yes_response": "",
"no_response": ""
}
]

Here's the Reddit activity to analyze:
${JSON.stringify(recentComments)}

Generate the JSON response:`

  try {
    const response = await getGeminiResponse(roastPrompt)

    await Roast.findOneAndUpdate(
      { username },
      { questions: response },
      { upsert: true, new: true }
    )
    
    return response
  } catch (error) {
    console.error('Error generating roast questions:', error)
    throw error
  }
}

async function generateDetailedRoast(comments, username) {
  const detailedRoastPrompt = `Based on the Reddit posts and comments below, write a detailed roast of the user. Be witty, sarcastic, chaotic, even unhinged if needed. 

You're allowed to use less grammar or slang if it makes it feel more Gen Z or human. Avoid being formal or robotic. Focus on how they post, what they post, their energy, patterns, obsessions, hypocrisy, and weird subreddit choices.

Make it sharp, clever, ruthless if needed but still fun. No filters. Just pure roast.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.
Start directly with the roast do not write any intro like "Alright", "Okay", or "Here's the roast" etc. Do not refer to the user by any name or even as user, It should be like a friend talking to another friend.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a detailed roast (strictly around 300 words):`

  try {
    const response = await getGeminiResponse(detailedRoastPrompt, 0, true)

    await Roast.findOneAndUpdate(
      { username },
      { roast: response },
      { upsert: true, new: true }
    )
    
    return response
  } catch (error) {
    console.error('Error generating detailed roast:', error)
    throw error
  }
}

async function generateStrengthAnalysis(comments, username) {
  const strengthPrompt = `Based on the Reddit posts and comments below, point out the user's strengths and good traits. It can be chaotic or funny, but try to keep it real and give some actual insight too. Not in a boring way. Make it spicy, honest, and dark if needed. If they're helpful, smart, funny, weird in a good way, or just consistently based, say it.

Use casual tone, no need for proper grammar, make it feel like a person speaking, not a corporate summary. If they're quietly unhinged but effective, say that too.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.
Start directly with the roast do not write any intro like "Alright", "Okay", or "Here's the roast" etc. Do not refer to the user by any name or even as user, It should be like a friend talking to another friend.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a strength analysis (strictly around 150 words):`

  try {
    const response = await getGeminiResponse(strengthPrompt, 0, true)

    await Roast.findOneAndUpdate(
      { username },
      { strength: response },
      { upsert: true, new: true }
    )
    
    return response
  } catch (error) {
    console.error('Error generating strength analysis:', error)
    throw error
  }
}

async function generateWeaknessAnalysis(comments, username) {
  const weaknessPrompt = `Based on the Reddit posts and comments below, call out the user's weak spots. Not in a boring way. Make it spicy, honest, and dark if needed. If they overshare, if they post like a fed, if they argue too much, if they simp hard or doomscroll daily, say it.

Make it feel like a friend calling them out while still kinda loving the chaos. Use slang, less grammar, TikTok brain energy if needed.

Give actual insight too, not just insults.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.
Start directly with the roast do not write any intro like "Alright", "Okay", or "Here's the roast" etc. Do not refer to the user by any name or even as user, It should be like a friend talking to another friend.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a weakness analysis (strictly around 150 words):`

  try {
    const response = await getGeminiResponse(weaknessPrompt, 0, true)
    
    await Roast.findOneAndUpdate(
      { username },
      { weakness: response },
      { upsert: true, new: true }
    )
    
    return response
  } catch (error) {
    console.error('Error generating weakness analysis:', error)
    throw error
  }
}

async function generateLoveLifeAnalysis(comments, username) {
  const loveLifePrompt = `Based on the Reddit posts and comments below, make fun, dark, chaotic, or suspicious guesses about this user's love life. Be entertaining. Maybe they overshare, maybe they've never touched grass, maybe they flirt like an NPC. Whatever it is, call it out.

Use casual tone, Gen Z energy, less grammar is fine. Make it feel like a weirdly accurate, lowkey disturbing but funny read.

But still try to give some insight into how they might be in relationships or what they actually want.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.
Start directly with the roast do not write any intro like "Alright", "Okay", or "Here's the roast" etc. Do not refer to the user by any name or even as user, It should be like a friend talking to another friend.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a love life analysis (strictly around 150 words):`

  try {
    const response = await getGeminiResponse(loveLifePrompt, 0, true)
    
    await Roast.findOneAndUpdate(
      { username },
      { loveLife: response },
      { upsert: true, new: true }
    )
    
    return response
  } catch (error) {
    console.error('Error generating love life analysis:', error)
    throw error
  }
}

async function generateLifePurposeAnalysis(comments, username) {
  const lifePurposePrompt = `Based on the Reddit posts and comments below, guess what this user's life purpose is or what drives them. Could be something noble, chaotic, or just weird. Be creative and honest.

Be dark, sarcastic, or even deranged if it fits. But still try to make it feel like there's some truth or meaning behind whatever they're doing.

No need for proper grammar. Make it raw, sarcastic, and like a bored but observant friend guessing their destiny.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.
Start directly with the roast do not write any intro like "Alright", "Okay", or "Here's the roast" etc. Do not refer to the user by any name or even as user, It should be like a friend talking to another friend.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a life purpose analysis (strictly around 150 words):`

  try {
    const response = await getGeminiResponse(lifePurposePrompt, 0, true)

    await Roast.findOneAndUpdate(
      { username },
      { lifePurpose: response },
      { upsert: true, new: true }
    )
    
    return response
  } catch (error) {
    console.error('Error generating life purpose analysis:', error)
    throw error
  }
}

async function fetchRedditComments(username, maxComments = 250) {
  const comments = [];
  let after = null;
  let currentAttempts = 0;
  const maxAttempts = 8;

  while (currentAttempts < maxAttempts && comments.length < maxComments) {
    currentAttempts++;

    try {
      let url = `https://old.reddit.com/user/${username}/comments/.json?limit=100`;
      if (after) {
        url += `&after=${after}`;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; SM-J3109 Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.data || !data.data.children || !Array.isArray(data.data.children)) {
        throw new Error('User not found or invalid response');
      }

      const children = data.data.children;

      if (children.length === 0) {
        if (currentAttempts === 1 && comments.length === 0) {
          throw new Error('No comments found for this user');
        }
        break;
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
            return comments;
          }
        }
      }

      const newAfter = data?.data?.after;
      
      if (!newAfter || newAfter === after) {
        break;
      }

      after = newAfter;

      if (newCommentsCount === 0) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      if (error.message.includes('User not found') || error.message.includes('No comments found')) {
        throw error;
      }
      console.error(`Attempt ${currentAttempts} failed:`, error.message);
      if (currentAttempts >= maxAttempts) {
        throw new Error('Failed to fetch comments after multiple attempts');
      }
    }
  }

  return comments;
}

async function fetchUserProfile(username) {
  try {
    const response = await fetch(`https://old.reddit.com/user/${username}/about.json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; SM-J3109 Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found. Please try with a different username.');
      }
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.data || data.error) {
      throw new Error('User not found. Please try with a different username.');
    }

    if (data?.data?.subreddit) {
      const profile = data.data.subreddit;
      let avatar = profile.icon_img || profile.community_icon || null;

      if (avatar && !avatar.includes('i.redd.it')) {
        avatar = 'https://www.redditstatic.com/avatars/avatar_default_01_FF4500.png';
      }
      
      return {
        name: profile.display_name_prefixed || profile.display_name || null,
        avatar: avatar
      };
    } else {
      throw new Error('User not found. Please try with a different username.');
    }
  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error.message.includes('User not found')) {
      throw error;
    }
    
    throw new Error('User not found. Please try with a different username.');
  }
}

router.post('/', limiter, async (c) => {
  try {
    const { username } = await c.req.json()

    if (!username || !username.trim()) {
      return c.json({
        success: false,
        message: 'Username is required'
      }, 400)
    }

    const cleanUsername = username.trim().startsWith('u/') ? username.trim().slice(2) : username.trim()

    try {
      const existingUser = await Roast.findOne({ 
        username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
      });

      if (existingUser) {
        return c.json({
          success: true,
          redirect: true,
          username: existingUser.username,
          message: 'User already exists in database'
        }, 200)
      }

      const userProfile = await fetchUserProfile(cleanUsername);
      const comments = await fetchRedditComments(cleanUsername, 250);

      if (comments.length === 0) {
        return c.json({
          success: false,
          message: 'No comments found for this user'
        }, 404)
      }

      const subreddits = extractSubreddits(comments)

      try {
        await Roast.findOneAndUpdate(
          { username: cleanUsername },
          { 
            username: cleanUsername,
            avatar: userProfile.avatar,
            subreddits: subreddits,
            updatedAt: new Date()
          },
          { 
            upsert: true,
            new: true 
          }
        )
      } catch (dbError) {
        console.error('Error updating basic data in MongoDB:', dbError)
      }

      const [questionsResult, ...otherResults] = await Promise.allSettled([
        generateRoastQuestions(comments, cleanUsername),
        generateDetailedRoast(comments, cleanUsername),
        generateStrengthAnalysis(comments, cleanUsername),
        generateWeaknessAnalysis(comments, cleanUsername),
        generateLoveLifeAnalysis(comments, cleanUsername),
        generateLifePurposeAnalysis(comments, cleanUsername)
      ])

      if (questionsResult.status === 'rejected') {
        console.error('Error generating questions:', questionsResult.reason)
        return c.json({
          success: false,
          message: 'Failed to generate roast questions',
          error: questionsResult.reason.message
        }, 500)
      }

      return c.json({
        success: true,
        redirect: false,
        message: 'Roast questions generated successfully, other analyses completed',
      }, 200)

    } catch (redditError) {
      console.error('Reddit fetch error:', redditError)
      
      return c.json({
        success: false,
        message: redditError.message || 'Failed to fetch Reddit data'
      }, 404)
    }
    
  } catch (error) {
    console.error('Error in roast generation:', error)
    return c.json({
      success: false,
      message: 'Failed to process roast request',
      error: error.message
    }, 500)
  }
})

export default router