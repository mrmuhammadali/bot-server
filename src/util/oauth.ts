// libs
import getOr from 'lodash/fp/getOr'
import { post as requestPost, RequestResponse } from 'request'
import { promisify } from 'util'
import { Request, Response, Router } from 'express'
import URLSearchParams from 'url-search-params'

// src

const requestPostAsync: any = promisify(requestPost)

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
  const query: string = new URLSearchParams({
    response_type: 'code',
    ...authCodeUrlParams,
  }).toString()

  return `${hostUrl}?${query}`
}

export type AuthCallbackController = (
  request: Request,
  response: Response,
  tokenResponse: Object,
) => void

export type AccessTokenParams = {
  redirect_uri?: string
  client_id: string
  client_secret: string
  code?: string
  grant_type?: string
}

export function setupAuthCallbackRoute(
  controller: AuthCallbackController,
  accessTokenUrl: string,
  params: AccessTokenParams,
  path?: string,
) {
  const newPath = path || '/api/auth_callback'
  return Router().get(newPath, (req: Request, res: Response) => {
    const http = getOr('http', 'x-forwarded-proto')(req.headers)
    const { host } = req.headers
    const redirect_uri = `${http}://${host}${newPath}`
    const authCode = getOr('', 'code')(req.query)
    const query: string = new URLSearchParams({
      redirect_uri,
      code: authCode,
      grant_type: 'authorization_code',
      ...params,
    }).toString()

    const tokenPromise = requestPostAsync({
      url: accessTokenUrl,
      body: query,
    }).then((tokenResponse: RequestResponse) => tokenResponse.body)

    controller(req, res, tokenPromise)
  })
}
