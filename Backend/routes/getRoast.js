import { Hono } from 'hono'
import Roast from '../models/Roast.js'

const router = new Hono()

router.get('/:username', async (c) => {
  try {
    const username = c.req.param('username')
    
    if (!username) {
      return c.json({
        success: false,
        message: 'Username parameter is required'
      }, 400)
    }

    const cleanUsername = username?.startsWith('u/') ? username.slice(2) : username

    // Try to find roast data for the user
    let roastData = await Roast.findOne({ username: cleanUsername })
      .sort({ createdAt: -1 })
      .select('username avatar subreddits roast strength weakness loveLife lifePurpose createdAt updatedAt')

    // If not found, try case-insensitive search
    if (!roastData) {
      roastData = await Roast.findOne({ 
        username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
      })
      .sort({ createdAt: -1 })
      .select('username avatar subreddits roast strength weakness loveLife lifePurpose createdAt updatedAt')
    }

    if (!roastData) {
      return c.json({
        success: false,
        message: 'No roast found for this user. Please generate a new roast.'
      }, 404)
    }

    // Check if we have at least the basic roast questions (stored in roast field)
    if (!roastData.roast) {
      return c.json({
        success: false,
        message: 'Roast data incomplete. Please generate a new roast.'
      }, 404)
    }

    return c.json({
      success: true,
      data: {
        username: roastData.username,
        avatar: roastData.avatar,
        subreddits: roastData.subreddits,
        roastQuestions: roastData.roast,
        aiSummaries: {
          detailedRoast: roastData.roast,
          strengthAnalysis: roastData.strength,
          weaknessAnalysis: roastData.weakness,
          loveLifeAnalysis: roastData.loveLife,
          lifePurposeAnalysis: roastData.lifePurpose
        },
        createdAt: roastData.createdAt,
        updatedAt: roastData.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching roast data:', error)
    return c.json({
      success: false,
      message: 'Server error while fetching roast data'
    }, 500)
  }
})

export default router