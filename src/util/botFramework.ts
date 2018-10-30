// libs
import { BotFrameworkAdapter, ConversationState, TurnContext } from 'botbuilder'
import { Request, Response, Router } from 'express'

type AppCredentials = { appId: string; appPassword: string }

export function getBotFrameworkAdapter(
  appCredentials: AppCredentials,
  conversationState: ConversationState,
): BotFrameworkAdapter {
  const adapter: BotFrameworkAdapter = new BotFrameworkAdapter(appCredentials)

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

export type BotFrameworkConfig = {
  appCredentials: AppCredentials
  iMRoutePath: string
}

export function setupIMRoute(
  botFrameworkConfig: BotFrameworkConfig,
  conversationState: ConversationState,
  iMController: (turnContext: TurnContext) => Promise<any>,
): Router {
  const { iMRoutePath, appCredentials } = botFrameworkConfig
  const adapter: BotFrameworkAdapter = getBotFrameworkAdapter(
    appCredentials,
    conversationState,
  )
  const router = Router()
  router.post(iMRoutePath, (req: Request, res: Response) => {
    adapter.processActivity(req, res, iMController)
  })

  return router
}
