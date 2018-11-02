// libs
import {
  BotFrameworkAdapter,
  ConversationState,
  MemoryStorage,
  TurnContext,
} from 'botbuilder'
import { Router } from 'express'

// src
import {
  BotFrameworkConfig,
  getBotFrameworkAdapter,
  setupIMRoute,
} from '../util/botFramework'
import { getBotTurnController } from '../controllers/gitBot'
import { GITLAB_BOT_MS_CREDS } from '../constants'

// setting up botframework incoming messages route
const memoryStorage: MemoryStorage = new MemoryStorage()
const conversationState: ConversationState = new ConversationState(
  memoryStorage,
)

const botAdapter: BotFrameworkAdapter = getBotFrameworkAdapter(
  GITLAB_BOT_MS_CREDS,
  conversationState,
)
const onTurn = getBotTurnController(conversationState)
const iMController = async (turnContext: TurnContext) => {
  // Call onTurn() to handle all incoming messages.
  await onTurn(turnContext)
}
const botFrameworkConfig: BotFrameworkConfig = {
  welcomeMessage: 'Welcome <%= user %>',
  startupMessage: 'Startup',
}
const router = Router()

router.use(setupIMRoute(iMController, botAdapter, botFrameworkConfig))

export default router
