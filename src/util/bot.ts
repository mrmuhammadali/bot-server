// libs
import { Request, Response, Router } from 'express'
import {
  BotFrameworkAdapter,
  ConversationState,
  MemoryStorage,
  TurnContext,
} from 'botbuilder'

type AppCredentials = { appId: string; appPassword: string }

export function setupBotFrameworkAdapter(
  appCredentials: AppCredentials,
  memoryStorage: MemoryStorage,
): BotFrameworkAdapter {
  const adapter: BotFrameworkAdapter = new BotFrameworkAdapter(appCredentials)
  const conversationState: ConversationState = new ConversationState(
    memoryStorage,
  )

  adapter.onTurnError = async (turnContext: TurnContext, error: Error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`)
    // Send a message to the user.
    turnContext.sendActivity(`Oops. Something went wrong!`)
    // Clear out state and save changes so the user is not stuck in a bad state.
    await conversationState.clear(turnContext)
    await conversationState.saveChanges(turnContext)
  }

  return adapter
}

export function setupIncomingMessagesRoute(
  incomingMessagesController: (turnContext: TurnContext) => Promise<any>,
  incomingMessagesRoutePath: string,
  adapter: BotFrameworkAdapter,
): Router {
  const router = Router()
  router.post(incomingMessagesRoutePath, (req: Request, res: Response) => {
    adapter.processActivity(req, res, incomingMessagesController)
  })

  return router
}
