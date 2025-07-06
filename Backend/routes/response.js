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
    process.env.GEMINI_API_KEY_2
  ].filter(Boolean) // Remove any undefined keys
  
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
  
  const modelName = useProModel ? "gemini-2.5-flash" : "gemini-2.5-flash"
  
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i]
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
        if (i === API_KEYS.length - 1) {
          throw new Error(`All API keys failed. Last error: ${response.status}`)
        }
      }
    } catch (error) {
      console.error(`Error with API Key ${i + 1}:`, error.message)
      if (i === API_KEYS.length - 1) {
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

// Generate roast questions concurrently
async function generateRoastQuestions(comments, username, avatar, subreddits) {
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
${JSON.stringify(comments)}

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
  const detailedRoastPrompt = `Based on the Reddit posts and comments below, write a detailed roast of the user. Act like you've been watching them from a dark corner of the internet. Be witty, sarcastic, chaotic, even unhinged if needed. 

You're allowed to use less grammar or slang if it makes it feel more Gen Z or human. Avoid being formal or robotic. Focus on how they post, what they post, their energy, patterns, obsessions, hypocrisy, and weird subreddit choices.

Make it sharp, clever, ruthless if needed but still fun. No filters. Just pure roast.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a detailed roast (aound 300 words):`

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
  const strengthPrompt = `Based on the Reddit posts and comments below, point out the user's strengths and good traits. It can be chaotic or funny, but try to keep it real and give some actual insight too. If they're helpful, smart, funny, weird in a good way, or just consistently based, say it.

Use casual tone, no need for proper grammar, make it feel like a person speaking, not a corporate summary. If they're quietly unhinged but effective, say that too.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a strength analysis (around 150 words):`

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

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a weakness analysis (around 150 words):`

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

// Generate love life analysis concurrently
async function generateLoveLifeAnalysis(comments, username) {
  const loveLifePrompt = `Based on the Reddit posts and comments below, make fun, dark, chaotic, or suspicious guesses about this user's love life. Be entertaining. Maybe they overshare, maybe they've never touched grass, maybe they flirt like an NPC. Whatever it is, call it out.

Use casual tone, Gen Z energy, less grammar is fine. Make it feel like a weirdly accurate, lowkey disturbing but funny read.

But still try to give some insight into how they might be in relationships or what they actually want.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a love life analysis (around 150 words):`

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

// Generate life purpose analysis concurrently
async function generateLifePurposeAnalysis(comments, username) {
  const lifePurposePrompt = `Based on the Reddit posts and comments below, guess what this user's life purpose is or what drives them. Could be something noble, chaotic, or just weird. Be creative and honest.

Be dark, sarcastic, or even deranged if it fits. But still try to make it feel like there's some truth or meaning behind whatever they're doing.

No need for proper grammar. Make it raw, sarcastic, and like a bored but observant friend guessing their destiny.

DO NOT USE ANY MARKDOWN FORMATTING. No asterisks, no bold, no italics, no headers, no bullet points. Just plain text.

Here's the Reddit activity to analyze:
${JSON.stringify(comments)}

Generate a life purpose analysis (around 150 words):`

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

router.post('/', limiter, async (c) => {
  try {
    const { comments, username, name, avatar } = await c.req.json()

    const subreddits = extractSubreddits(comments)
    const cleanUsername = username?.startsWith('u/') ? username.slice(2) : username

    try {
      await Roast.findOneAndUpdate(
        { username: cleanUsername },
        { 
          username: cleanUsername,
          avatar: avatar,
          subreddits: subreddits,
          updatedAt: new Date()
        },
        { 
          upsert: true,
          new: true 
        }
      )
      console.log(`User data updated/created for ${cleanUsername}`)
    } catch (dbError) {
      console.error('Error updating basic data in MongoDB:', dbError)
    }

    // Start all tasks simultaneously
    const [questionsResult, ...otherResults] = await Promise.allSettled([
      generateRoastQuestions(comments, cleanUsername, avatar, subreddits),
      generateDetailedRoast(comments, cleanUsername),
      generateStrengthAnalysis(comments, cleanUsername),
      generateWeaknessAnalysis(comments, cleanUsername),
      generateLoveLifeAnalysis(comments, cleanUsername),
      generateLifePurposeAnalysis(comments, cleanUsername)
    ])

    // Check if questions generation was successful
    if (questionsResult.status === 'rejected') {
      console.error('Error generating questions:', questionsResult.reason)
      return c.json({
        success: false,
        message: 'Failed to generate roast questions',
        error: questionsResult.reason.message
      }, 500)
    }

    console.log(`Questions generated successfully for ${cleanUsername}`)

    // Log results of other tasks (they continue in background)
    const taskNames = ['detailedRoast', 'strengthAnalysis', 'weaknessAnalysis', 'loveLifeAnalysis', 'lifePurposeAnalysis']
    otherResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`${taskNames[index]} completed successfully for ${cleanUsername}`)
      } else {
        console.error(`${taskNames[index]} failed for ${cleanUsername}:`, result.reason)
      }
    })

    return c.json({
      success: true,
      message: 'Roast questions generated successfully, other analyses completed',
    }, 200)
    
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