import { Hono } from 'hono'
import Roast from '../models/Roast.js'

const router = new Hono()

// This route is now the primary way to get roast data.
// It checks if the interactive questions have been seen yet.
router.get('/:username', async (c) => {
  const { username } = c.req.param()
  try {
    const roast = await Roast.findOne({ username })

    if (!roast) {
      return c.json({ success: false, message: 'Roast not found' }, 404)
    }

    // If questions exist but haven't been seen, send them for the chat.
    if (roast.questions && !roast.questionsSeen) {
      return c.json({
        success: true,
        type: 'questions',
        data: {
          questions: roast.questions,
          username: roast.username,
          avatar: roast.avatar,
        },
      })
    }

    // If questions have been seen (or don't exist), return the full summaries.
    return c.json({
      success: true,
      type: 'summaries',
      data: {
        username: roast.username,
        avatar: roast.avatar,
        subreddits: roast.subreddits,
        aiSummaries: {
          detailedRoast: roast.roast,
          strengthAnalysis: roast.strength,
          weaknessAnalysis: roast.weakness,
          loveLifeAnalysis: roast.loveLife,
          lifePurposeAnalysis: roast.lifePurpose,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching roast data:', error)
    return c.json({ success: false, message: 'Server error' }, 500)
  }
})

// This route specifically marks the questions as seen and returns them.
// The frontend will call this before starting the chat sequence.
router.post('/:username/seen', async (c) => {
  const { username } = c.req.param()
  try {
    const roast = await Roast.findOneAndUpdate(
      { username },
      { questionsSeen: true },
      { new: true }
    )

    if (!roast) {
      return c.json({ success: false, message: 'Roast not found' }, 404)
    }

    return c.json({ success: true, message: 'Questions marked as seen.' })
  } catch (error) {
    console.error('Error marking questions as seen:', error)
    return c.json({ success: false, message: 'Server error' }, 500)
  }
})

export default router
