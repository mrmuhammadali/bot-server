// libs
import { Router } from 'express'

// src
import { getAuthCallbackController } from '../controllers/gitBot'
import { AccessTokenParams, setupAuthCallbackRoute } from '../util/oauth'

const gitlabBotAppCreds = {
  appId: process.env.ASSEMBLA_BOT_APP_ID,
  appPassword: process.env.ASSEMBLA_BOT_APP_PASSWORD,
}
// setting up auth callback route for gitBot
const authCallbackController = getAuthCallbackController(gitlabBotAppCreds)
const accessTokenUrl = ''
const accessTokenParams: AccessTokenParams = {
  client_id: process.env.GITLAB_CLIENT_ID,
  client_secret: process.env.GITLAB_CLIENT_SECRET,
}

const router = Router()

router.use(
  setupAuthCallbackRoute(
    authCallbackController,
    accessTokenUrl,
    accessTokenParams,
  ),
)

export default router
