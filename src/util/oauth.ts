// libs
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

export type AuthCallbackController = (
  request: Request,
  response: Response,
  tokenResponse: Object,
) => void

// TODO: get token response by using auth code
export function setupAuthCallbackRoute(
  authCallBackController: AuthCallbackController,
  path?: string,
) {
  return Router().get(
    path || '/api/auth_callback',
    (req: Request, res: Response) => {
      const authCode = getOr('', 'code')(req.query)
      authCallBackController(req, res, {})
    },
  )
}
