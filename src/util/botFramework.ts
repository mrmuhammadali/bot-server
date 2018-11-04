// libs
import {
  Activity,
  ActivityTypes,
  RoleTypes,
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

export type AppCredentials = { appId: string; appPassword: string }

export function getTurnContext(
  appCredentials: AppCredentials,
  conversationId: string,
): TurnContext {
  const botAdapter: BotFrameworkAdapter = new BotFrameworkAdapter(
    appCredentials,
  )
  const { appId } = appCredentials
  const activity: Partial<Activity> = {
    type: ActivityTypes.Message,
    serviceUrl: 'https://smba.trafficmanager.net/apis/',
    conversation: {
      id: conversationId,
      role: RoleTypes.User,
      name: '',
      isGroup: false,
      conversationType: '',
    },
    from: { id: appId, role: RoleTypes.Bot, name: '' },
  }

  return new TurnContext(botAdapter, activity)
}

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
  iMRoutePath?: string
  welcomeMessage?: string
  startupMessage?: string
}

export function setupIMRoute(
  iMController: (turnContext: TurnContext) => Promise<any>,
  botAdapter: BotFrameworkAdapter,
  botFrameworkConfig: BotFrameworkConfig = {},
): Router {
  const {
    iMRoutePath = '/api/messages',
    welcomeMessage,
    startupMessage,
  } = botFrameworkConfig

  return Router().post(iMRoutePath, (req: Request, res: Response) => {
    botAdapter.processActivity(req, res, async (turnContext: TurnContext) => {
      if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
        await sendStartupMessage(turnContext, startupMessage)
        await sendWelcomeMessage(turnContext, welcomeMessage)
      }

      await iMController(turnContext)
    })
  })
}
