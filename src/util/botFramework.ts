// libs
import {
  ActivityTypes,
  BotFrameworkAdapter,
  ConversationState,
  TurnContext,
} from 'botbuilder'
import forEach from 'lodash/fp/forEach'
import { Request, Response, Router } from 'express'
import some from 'lodash/fp/some'
import template from 'lodash/fp/template'

/**
 * Send a custom startup message when this bot is added in a group.
 * @param {TurnContext} turnContext A TurnContext instance for sending this message.
 * @param {string} startupMessage A custom startup message.
 */
async function sendStartupMessage(
  turnContext: TurnContext,
  startupMessage?: string,
) {
  const {
    membersAdded = [],
    recipient: { id: botId },
  } = turnContext.activity
  const isBotAdded = some(['id', botId])(membersAdded)

  if (startupMessage && isBotAdded) {
    await turnContext.sendActivity(startupMessage)
  }
}

/**
 * Send a custom welcome message when a new user added in a group.
 * @param {TurnContext} turnContext A TurnContext instance for sending this message.
 * @param {string} welcomeMessage A custom welcome message.
 */
async function sendWelcomeMessage(
  turnContext: TurnContext,
  welcomeMessage?: string,
) {
  const {
    membersAdded = [],
    recipient: { id: botId },
  } = turnContext.activity

  if (welcomeMessage) {
    forEach(async ({ id, name }) => {
      if (id !== botId) {
        const compiled = template(welcomeMessage)
        await turnContext.sendActivity(compiled({ user: name }))
      }
    })(membersAdded)
  }
}

type AppCredentials = { appId: string; appPassword: string }

export function getBotFrameworkAdapter(
  appCredentials: AppCredentials,
  conversationState?: ConversationState,
): BotFrameworkAdapter {
  const adapter: BotFrameworkAdapter = new BotFrameworkAdapter(appCredentials)

  adapter.onTurnError = async (turnContext: TurnContext, error: Error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`)
    // Send a message to the user.
    turnContext.sendActivity(`Oops. Something went wrong!`)

    if (conversationState) {
      // Clear out state and save changes so the user is not stuck in a bad state.
      await conversationState.clear(turnContext)
      await conversationState.saveChanges(turnContext)
    }
  }

  return adapter
}

export type BotFrameworkConfig = {
  appCredentials: AppCredentials
  iMRoutePath?: string
  welcomeMessage?: string
  startupMessage?: string
}

export function setupIMRoute(
  botFrameworkConfig: BotFrameworkConfig,
  iMController: (turnContext: TurnContext) => Promise<any>,
  conversationState?: ConversationState,
): Router {
  const {
    appCredentials,
    iMRoutePath = '/api/messages',
    welcomeMessage,
    startupMessage,
  } = botFrameworkConfig
  const adapter: BotFrameworkAdapter = getBotFrameworkAdapter(
    appCredentials,
    conversationState,
  )
  const router = Router()
  router.post(iMRoutePath, (req: Request, res: Response) => {
    adapter.processActivity(req, res, async (turnContext: TurnContext) => {
      if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
        await sendStartupMessage(turnContext, startupMessage)
        await sendWelcomeMessage(turnContext, welcomeMessage)
      }

      await iMController(turnContext)
    })
  })

  return router
}
