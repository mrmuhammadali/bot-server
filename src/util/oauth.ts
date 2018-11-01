// libs
import {
  Activity,
  ActivityTypes,
  BotFrameworkAdapter,
  RoleTypes,
  TurnContext,
} from 'botbuilder'
import getOr from 'lodash/fp/getOr'
import { Request, Response, Router } from 'express'
import URLSearchParams from 'url-search-params'

// src

export type AuthCodeUrlParams = {
  client_id: string
  redirect_uri?: string
  response_type?: string
  state: string
}

export function getAuthCodeUrl(
  hostUrl: string,
  authCodeUrlParams: AuthCodeUrlParams,
): string {
  const response_type = authCodeUrlParams.response_type || 'code'
  const query: string = new URLSearchParams({
    ...authCodeUrlParams,
    response_type,
  }).toString()

  return `${hostUrl}?${query}`
}

function createActivity(conversationId: string, appId: string): Activity {
  return {
    type: ActivityTypes.Message,
    serviceUrl: 'https://smba.trafficmanager.net/apis/',
    conversation: {
      id: conversationId,
      isGroup: true,
      conversationType: '',
      name: '',
      role: RoleTypes.User,
    },
    recipient: { id: conversationId, name: '', role: RoleTypes.User },
    from: { id: appId, name: '', role: RoleTypes.Bot },
    channelId: 'skype',
    text: 'Hello auto',
    label: '',
    valueType: '',
  }
}

// TODO: complete the auth token flow
export function setupAuthCallbackRoute(
  botAdapter: BotFrameworkAdapter,
  botAppId: string,
  path?: string,
) {
  return Router().get(
    path || '/api/auth_callback',
    (req: Request, res: Response) => {
      const authCode = getOr('', 'code')(req.query)
      const conversationId = getOr('', 'state')(req.query)
      const turnContext: TurnContext = new TurnContext(
        botAdapter,
        createActivity(conversationId, botAppId),
      )
      turnContext.sendActivity('Hi auto')
    },
  )
}
