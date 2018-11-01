// libs
import getOr from 'lodash/fp/getOr'
import { Request, Response, Router } from 'express'
import URLSearchParams from 'url-search-params'

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

// TODO: complete the auth token flow
export function setupAuthCallbackRoute(path?: string) {
  return Router().get(
    path || '/api/auth_callback',
    (req: Request, res: Response) => {
      const authCode = getOr('', 'code')(req.query)
      const conversationId = getOr('', 'state')(req.query)
    },
  )
}
