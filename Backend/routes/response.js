import { Hono } from 'hono'
import { rateLimiter } from 'hono-rate-limiter'
import Roast from '../models/Roast.js'
import { fetchRedditComments, fetchUserProfile } from '../services/redditApi.js'

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
    process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3, process.env.GEMINI_API_KEY_4, process.env.GEMINI_API_KEY_5, process.env.GEMINI_API_KEY_6, process.env.GEMINI_API_KEY_7, process.env.GEMINI_API_KEY_8, process.env.GEMINI_API_KEY_9, process.env.GEMINI_API_KEY_10, process.env.GEMINI_API_KEY_11, process.env.GEMINI_API_KEY_12, process.env.GEMINI_API_KEY_13, process.env.GEMINI_API_KEY_14, process.env.GEMINI_API_KEY_15, process.env.GEMINI_API_KEY_16, process.env.GEMINI_API_KEY_17, process.env.GEMINI_API_KEY_18, process.env.GEMINI_API_KEY_19, process.env.GEMINI_API_KEY_20, process.env.GEMINI_API_KEY_21, process.env.GEMINI_API_KEY_22, process.env.GEMINI_API_KEY_23, process.env.GEMINI_API_KEY_24, process.env.GEMINI_API_KEY_25, process.env.GEMINI_API_KEY_26, process.env.GEMINI_API_KEY_27, process.env.GEMINI_API_KEY_28, process.env.GEMINI_API_KEY_29, process.env.GEMINI_API_KEY_30, process.env.GEMINI_API_KEY_31, process.env.GEMINI_API_KEY_32, process.env.GEMINI_API_KEY_33, process.env.GEMINI_API_KEY_34, process.env.GEMINI_API_KEY_35, process.env.GEMINI_API_KEY_36, process.env.GEMINI_API_KEY_37, process.env.GEMINI_API_KEY_38, process.env.GEMINI_API_KEY_39, process.env.GEMINI_API_KEY_40, process.env.GEMINI_API_KEY_41, process.env.GEMINI_API_KEY_42, process.env.GEMINI_API_KEY_43, process.env.GEMINI_API_KEY_44, process.env.GEMINI_API_KEY_45, process.env.GEMINI_API_KEY_46, process.env.GEMINI_API_KEY_47, process.env.GEMINI_API_KEY_48, process.env.GEMINI_API_KEY_49, process.env.GEMINI_API_KEY_50, process.env.GEMINI_API_KEY_51, process.env.GEMINI_API_KEY_52, process.env.GEMINI_API_KEY_53, process.env.GEMINI_API_KEY_54, process.env.GEMINI_API_KEY_55, process.env.GEMINI_API_KEY_56, process.env.GEMINI_API_KEY_57, process.env.GEMINI_API_KEY_58, process.env.GEMINI_API_KEY_59, process.env.GEMINI_API_KEY_60, process.env.GEMINI_API_KEY_61, process.env.GEMINI_API_KEY_62, process.env.GEMINI_API_KEY_63, process.env.GEMINI_API_KEY_64, process.env.GEMINI_API_KEY_65, process.env.GEMINI_API_KEY_66, process.env.GEMINI_API_KEY_67, process.env.GEMINI_API_KEY_68, process.env.GEMINI_API_KEY_69, process.env.GEMINI_API_KEY_70, process.env.GEMINI_API_KEY_71, process.env.GEMINI_API_KEY_72, process.env.GEMINI_API_KEY_73, process.env.GEMINI_API_KEY_74, process.env.GEMINI_API_KEY_75, process.env.GEMINI_API_KEY_76, process.env.GEMINI_API_KEY_77, process.env.GEMINI_API_KEY_78, process.env.GEMINI_API_KEY_79, process.env.GEMINI_API_KEY_80, process.env.GEMINI_API_KEY_81, process.env.GEMINI_API_KEY_82, process.env.GEMINI_API_KEY_83, process.env.GEMINI_API_KEY_84, process.env.GEMINI_API_KEY_85, process.env.GEMINI_API_KEY_86, process.env.GEMINI_API_KEY_87, process.env.GEMINI_API_KEY_88, process.env.GEMINI_API_KEY_89, process.env.GEMINI_API_KEY_90, process.env.GEMINI_API_KEY_91, process.env.GEMINI_API_KEY_92, process.env.GEMINI_API_KEY_93, process.env.GEMINI_API_KEY_94, process.env.GEMINI_API_KEY_95, process.env.GEMINI_API_KEY_96, process.env.GEMINI_API_KEY_97, process.env.GEMINI_API_KEY_98, process.env.GEMINI_API_KEY_99, process.env.GEMINI_API_KEY_100, process.env.GEMINI_API_KEY_101, process.env.GEMINI_API_KEY_102, process.env.GEMINI_API_KEY_103, process.env.GEMINI_API_KEY_104, process.env.GEMINI_API_KEY_105, process.env.GEMINI_API_KEY_106, process.env.GEMINI_API_KEY_107, process.env.GEMINI_API_KEY_108, process.env.GEMINI_API_KEY_109, process.env.GEMINI_API_KEY_110, process.env.GEMINI_API_KEY_111, process.env.GEMINI_API_KEY_112, process.env.GEMINI_API_KEY_113, process.env.GEMINI_API_KEY_114, process.env.GEMINI_API_KEY_115, process.env.GEMINI_API_KEY_116, process.env.GEMINI_API_KEY_117, process.env.GEMINI_API_KEY_118, process.env.GEMINI_API_KEY_119, process.env.GEMINI_API_KEY_120, process.env.GEMINI_API_KEY_121, process.env.GEMINI_API_KEY_122, process.env.GEMINI_API_KEY_123, process.env.GEMINI_API_KEY_124, process.env.GEMINI_API_KEY_125, process.env.GEMINI_API_KEY_126, process.env.GEMINI_API_KEY_127, process.env.GEMINI_API_KEY_128, process.env.GEMINI_API_KEY_129, process.env.GEMINI_API_KEY_130, process.env.GEMINI_API_KEY_131, process.env.GEMINI_API_KEY_132, process.env.GEMINI_API_KEY_133, process.env.GEMINI_API_KEY_134, process.env.GEMINI_API_KEY_135, process.env.GEMINI_API_KEY_136, process.env.GEMINI_API_KEY_137, process.env.GEMINI_API_KEY_138, process.env.GEMINI_API_KEY_139
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
  const recentComments = comments.slice(0, 150); // Keep limited for questions
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

async function generateCombinedRoast(comments, username) {
    const combinedRoastPrompt = `
You are an AI assistant. Your task is to analyze the user's Reddit activity provided below and generate a multi-part roast.
Your response MUST be a single, well-formed JSON object and nothing else. Do not include any text, markdown, or formatting outside of the JSON object. It is critical that all property names (keys) are enclosed in double quotes.

The JSON object must have the following keys: "detailedRoast", "strengthAnalysis", "weaknessAnalysis", "loveLifeAnalysis", "lifePurposeAnalysis".

**Reddit Activity to Analyze:**
\`\`\`json
${JSON.stringify(comments)}
\`\`\`

Now, generate the content for each key in the JSON object by following these individual prompts EXACTLY as described.

**1. For the "detailedRoast" key:**
*   **PROMPT:** Based on the Reddit posts and comments below, write a detailed roast of the user. Be witty, sarcastic, chaotic, even unhinged if needed. You're allowed to use less grammar or slang if it makes it feel more Gen Z or human. Avoid being formal or robotic. Focus on how they post, what they post, their energy, patterns, obsessions, hypocrisy, and weird subreddit choices. Make it sharp, clever, ruthless if needed but still fun. No filters. Just pure roast. Generate a detailed roast (strictly around 400 words).

**2. For the "strengthAnalysis" key:**
*   **PROMPT:** Based on the Reddit posts and comments below, call out their strengths and good traits—but make it spicy, unfiltered, and borderline feral. Think of it like a roast from someone who lowkey admires the chaos. If they're smart, helpful, funny, weirdly insightful, or just deranged in a productive way, point it out. Don’t be afraid to lean into the madness—if they’re quietly unhinged but effective, say it. If they post like someone who hasn’t slept in 3 days but still makes sense, highlight that. Be sarcastic, be real. Use casual tone, no need for proper grammar, make it feel like a person speaking, not a corporate summary. If they're quietly unhinged but effective, say that too. Be sarcastic and fun. Generate a strength analysis (strictly around 150 words).

**3. For the "weaknessAnalysis" key:**
*   **PROMPT:** Based on the Reddit posts and comments below, call out the user's weak spots. Not in a boring way. Make it spicy, honest, and dark if needed. If they overshare, if they post like a fed, if they argue too much, if they simp hard or doomscroll daily, say it. Make it feel like a friend calling them out while still kinda loving the chaos. Use slang, less grammar, TikTok brain energy if needed. Give actual insight too, not just insults. Be sarcastic and fun. Generate a weakness analysis (strictly around 150 words).

**4. For the "loveLifeAnalysis" key:**
*   **PROMPT:** Based on the Reddit posts and comments below, make fun, dark, chaotic, or suspicious guesses about this user's love life. Be entertaining. Maybe they overshare, maybe they've never touched grass, maybe they flirt like an NPC. Whatever it is, call it out. Use casual tone, Gen Z energy, less grammar is fine. Make it feel like a weirdly accurate, lowkey disturbing but funny read. But still try to give some insight into how they might be in relationships or what they actually want. Generate a love life analysis (strictly around 150 words).

**5. For the "lifePurposeAnalysis" key:**
*   **PROMPT:** Based on the Reddit posts and comments below, guess what this user's life purpose is or what drives them. Could be something noble, chaotic, or just weird. Be creative and honest. Be dark, sarcastic, or even deranged if it fits. But still try to make it feel like there's some truth or meaning behind whatever they're doing. No need for proper grammar. Make it raw, sarcastic, and like a bored but observant friend guessing their destiny. Generate a life purpose analysis (strictly around 150 words).

**Universal Rule:**
For all generated text values in the JSON object: DO NOT USE ANY MARKDOWN FORMATTING. This means no asterisks, no bolding, no italics, no headers, and no bullet points. All responses must be plain text. Sometimes the context won't be fully visible from the comment so you can make things up, but don't just assume anything based off just one (sometimes people say things that need more context or in a fun way, or they might be trolling), You are allowed to use swear words but not directly towards the user. Start directly with the roast do not write any intro like "Alright", "Okay", or "Here's the roast" etc. Do not refer to the user by any name or even as user, It should be like a friend talking to another friend. Your goal should be to roast them but not make them feel bad.
`;

    try {
        const response = await getGeminiResponse(combinedRoastPrompt, 0, true);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON object found in the AI response.");
        }
        const jsonString = jsonMatch[0];
        const parsedResponse = JSON.parse(jsonString);

        await Roast.findOneAndUpdate(
            { username },
            { 
                roast: parsedResponse.detailedRoast,
                strength: parsedResponse.strengthAnalysis,
                weakness: parsedResponse.weaknessAnalysis,
                loveLife: parsedResponse.loveLifeAnalysis,
                lifePurpose: parsedResponse.lifePurposeAnalysis,
            },
            { upsert: true, new: true }
        );
    
        return parsedResponse;
    } catch (error) {
        console.error('Error generating combined roast:', error);
        throw error;
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
      const comments = await fetchRedditComments(cleanUsername, 500);

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

      try {

        generateCombinedRoast(comments, cleanUsername).catch(error => {
          console.error('Background roast generation failed:', error);
        });
        
        await generateRoastQuestions(comments, cleanUsername);

        return c.json({
          success: true,
          redirect: false,
          message: 'Questions generated successfully, roast analysis generating in background',
        }, 200);

      } catch (questionsError) {
        console.error('Error generating questions:', questionsError);
        return c.json({
          success: false,
          message: 'Failed to generate roast questions',
          error: questionsError.message
        }, 500);
      }

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