// libs
import { Router } from 'express'

// src
import { getAuthCallbackController } from '../controllers/gitBot'
import {
  GITLAB_ACCESS_TOKEN_PARAMS,
  GITLAB_ACCESS_TOKEN_URL,
  GITLAB_BOT_MS_CREDS,
} from '../constants'
import { setupAuthCallbackRoute } from '../util/oauth'

// setting up auth callback route for gitBot
const gitlabAuthCallbackController = getAuthCallbackController(
  GITLAB_BOT_MS_CREDS,
)

const router = Router()

router.use(
  setupAuthCallbackRoute(
    gitlabAuthCallbackController,
    GITLAB_ACCESS_TOKEN_URL,
    GITLAB_ACCESS_TOKEN_PARAMS,
    '/api/gitlab/auth_callback'
  ),
)

export default router
