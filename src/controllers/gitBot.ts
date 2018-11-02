// libs
import { ActivityTypes, ConversationState, TurnContext } from 'botbuilder'
import { AuthCodeUrlParams, getAuthCodeUrl } from '../util/oauth'
import getOr from 'lodash/fp/getOr'
import { Request, Response } from 'express'
import toLower from 'lodash/fp/toLower'
import trim from 'lodash/fp/trim'

// src
import * as ActionTypes from '../constants/botActionTypes'
import { AppCredentials, getTurnContext } from '../util/botFramework'
import { AuthCallbackController } from '../util/oauth'
import {
  GITLAB_AUTH_CALLBACK_URL,
  GITLAB_AUTH_CODE_URL,
  GITLAB_CLIENT_ID,
} from '../constants'

export function getAuthCallbackController(
  appCredentials: AppCredentials,
): AuthCallbackController {
  return (req: Request, res: Response, tokenPromise: Promise<Object>) => {
    const conversationId = getOr('', 'state')(req.query)
    const { appId } = appCredentials
    const turnContext: TurnContext = getTurnContext(
      appCredentials,
      conversationId,
    )
    tokenPromise
      .then(token => {
        turnContext.sendActivity(token)
      })
      .catch(error => {
        turnContext.sendActivity("Couldn't authenticate.")
      })
    res.redirect(`https://join.skype.com/bot/${appId}`)
  }
}

async function connect(
  turnContext: TurnContext,
  hostUrl: string,
  authCodeUrlParams: AuthCodeUrlParams,
) {
  await turnContext.sendActivity(getAuthCodeUrl(hostUrl, authCodeUrlParams))
}

export function getBotTurnController(conversationState: ConversationState) {
  return async (turnContext: TurnContext) => {
    // Handle message activity type. User's responses via text or speech or
    // card interactions flow back to the bot as Message activity.
    // Message activities may contain text, speech, interactive cards, and
    // binary or unknown attachments.
    // see https://aka.ms/about-bot-activity-message to learn more about the
    // message and other activity types
    if (turnContext.activity.type === ActivityTypes.Message) {
      const {
        text,
        conversation: { id: conversationId },
      } = turnContext.activity
      const actionType = trim(toLower(text))

      switch (actionType) {
        case ActionTypes.CONNECT:
        case ActionTypes.CONNECT_GITLAB: {
          const authCodeUrlParams: AuthCodeUrlParams = {
            client_id: GITLAB_CLIENT_ID,
            redirect_uri: GITLAB_AUTH_CALLBACK_URL,
            state: conversationId,
          }
          await connect(
            turnContext,
            GITLAB_AUTH_CODE_URL,
            authCodeUrlParams,
          )
          break
        }
        default: {
          await turnContext.sendActivity(
            'Given command not supported, try HELP.',
          )
        }
      }
    }
    // Save state changes
    await conversationState.saveChanges(turnContext)
  }
}
