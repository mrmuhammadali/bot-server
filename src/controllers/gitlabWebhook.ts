// libs
import { CardFactory, TurnContext } from 'botbuilder'
import { Request, Response } from 'express'
import orderBy from 'lodash/orderBy'

// src
import * as EventTypes from '../constants/gitlabEventTypes'
import { getPushResponse } from '../util/gitEventsResponses'
import { getTurnContext } from '../util/botFramework'
import { GITLAB_BOT_MS_CREDS } from '../constants'

export default function gitlabWebhookController(req: Request, res: Response) {
  const { 'x-gitlab-event': eventType } = req.headers

  switch (eventType) {
    case EventTypes.PUSH_HOOK:
    case EventTypes.TAG_PUSH_HOOK: {
      const {
        object_kind: objectKind,
        user_avatar: userPicUrl,
        user_name: name,
        user_username: username,
        before,
        after,
        project_id: projectId,
        ref = '',
        project: { path_with_namespace: projectFullPath, web_url: webUrl },
        commits,
        total_commits_count: totalCommitsCount,
      } = req.body
      const branch = ref && ref.substr(ref.lastIndexOf('/') + 1)
      const userProfileUrl = `https://gitlab.com/${username}`
      const compareChangesUrl = `${webUrl}/compare/${before}...${after}`
      const pushResponse = getPushResponse(
        name,
        username,
        objectKind,
        totalCommitsCount,
        branch,
        projectFullPath,
        orderBy(commits, 'timestamp', 'desc'),
        userPicUrl,
        userProfileUrl,
        webUrl,
        compareChangesUrl,
      )

      // TODO: 1. get conversations by using projectId
      // 2. get turnContext by using those converationIds
      // 3. send push response to those conversations in Adaptive card
      const turnContext: TurnContext = getTurnContext(
        GITLAB_BOT_MS_CREDS,
        '29:1izxgeDK6McZ5AWzHoOt4zrxFw3dz92WHWuRrMW19SNGhnwhfQAuo710fgll4sdn4',
      )
      turnContext.sendActivity({
        attachments: [CardFactory.adaptiveCard(pushResponse)],
      })
      break
    }
    default:
      break
  }
}
