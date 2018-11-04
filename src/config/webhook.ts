// libs
import { Router } from 'express'

// src
import gitlabWebhook from '../controllers/gitlabWebhook'

const router = Router()

router.post('/api/gitlab/webhook', gitlabWebhook)

export default router
