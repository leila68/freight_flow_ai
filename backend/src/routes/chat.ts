import { Router } from 'express'
import { chatService } from '../ai/chat.service'

const router = Router()

// POST /api/chat 
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      })
    }

    const response = await chatService.handleMessage({
      message,
      sessionId,
    })

    return res.json(response)
  } catch (err) {
    next(err)
  }
})

export default router