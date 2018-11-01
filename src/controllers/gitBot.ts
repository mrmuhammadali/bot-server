// libs
import { ActivityTypes, ConversationState, TurnContext } from 'botbuilder'
import { AuthCodeUrlParams, getAuthCodeUrl } from '../util/oauth'
import toLower from 'lodash/fp/toLower'
import trim from 'lodash/fp/trim'

const ActionTypes = {
  CONNECT: 'connect',
  CONNECT_GITLAB: 'connect gitlab bot',
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
      console.log(turnContext.activity)

      switch (actionType) {
        case ActionTypes.CONNECT:
        case ActionTypes.CONNECT_GITLAB: {
          const hostUrl = 'https://gitlab.com/oauth/authorize'
          const authCodeUrlParams: AuthCodeUrlParams = {
            client_id: process.env.GITLAB_CLIENT_ID,
            // Change it when subdomain changes
            redirect_uri: 'https://4a86645b.ngrok.io/auth_callback',
            state: JSON.stringify(turnContext),
          }
          await connect(
            turnContext,
            hostUrl,
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
