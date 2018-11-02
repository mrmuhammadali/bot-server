export const GITLAB_CLIENT_ID = process.env.GITLAB_CLIENT_ID
export const GITLAB_CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET
export const GITLAB_ACCESS_TOKEN_PARAMS = {
  client_id: GITLAB_CLIENT_ID,
  client_secret: GITLAB_CLIENT_SECRET,
}

export const GITLAB_BOT_MS_CREDS = {
  appId: process.env.GITLAB_BOT_APP_ID,
  appPassword: process.env.GITLAB_BOT_APP_PASSWORD,
}

export const GITLAB_ACCESS_TOKEN_URL = 'https://gitlab.com/oauth/token'
export const GITLAB_AUTH_CODE_URL = 'https://gitlab.com/oauth/authorize'
export const GITLAB_AUTH_CALLBACK_URL =
  'https://fb15ad71.ngrok.io/api/auth_callback'
export const GITLAB_LOGO_URL = 'https://fb15ad71.ngrok.io/images/gitlab.png'
