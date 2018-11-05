// libs
import lowerCase from 'lodash/fp/lowerCase'
import size from 'lodash/fp/size'
import slice from 'lodash/slice'
import startCase from 'lodash/fp/startCase'
import toString from 'lodash/fp/toString'

function getSingleOrPlural(arraySize: number): 's' | '' {
  return arraySize > 1 ? 's' : ''
}

type Commit = {
  id: string
  message: string
  author: { name: string }
  url: string
}

function getCommitMessage(commit: Commit): Object {
  const {
    id,
    message,
    author: { name },
    url,
  } = commit

  return {
    type: 'Container',
    items: [
      {
        type: 'TextBlock',
        text: `[${id.substr(0, 8)}](${url}) by ${startCase(name)} - ${message}`,
      },
    ],
  }
}

export function getPushResponse(
  name: string,
  username: string,
  eventType: string,
  totalCommits: number,
  branchName: string,
  projectFullName: string,
  commits: Array<Commit>,
  userPicUrl: string,
  userProfileUrl: string,
  projectUrl: string,
  compareChangesUrl: string,
) {
  const remainingCommits = slice(commits, 1).map(getCommitMessage)

  const viewMoreAction = {
    type: 'Action.ShowCard',
    title: 'View More',
    card: {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      style: 'emphasis',
      body: [
        {
          type: 'Container',
          items: [
            {
              type: 'TextBlock',
              text: `Previous ${size(
                remainingCommits,
              )} commit${getSingleOrPlural(size(remainingCommits))}:`,
              weight: 'Bolder',
            },
            ...remainingCommits,
          ],
        },
      ],
    },
  }

  const compareChangesAction = {
    type: 'Action.OpenUrl',
    title: 'Compare Changes',
    url: compareChangesUrl,
  }

  const actions =
    size(commits) <= 1
      ? [compareChangesAction]
      : [compareChangesAction, viewMoreAction]

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.0',
    body: [
      {
        type: 'Container',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                items: [
                  {
                    type: 'Image',
                    selectAction: {
                      type: 'Action.OpenUrl',
                      url: userProfileUrl,
                    },
                    style: 'Person',
                    url: userPicUrl,
                    size: 'Small',
                  },
                ],
                width: 'auto',
              },
              {
                type: 'Column',
                items: [
                  {
                    type: 'TextBlock',
                    weight: 'Bolder',
                    text: startCase(name),
                    wrap: true,
                  },
                  {
                    type: 'TextBlock',
                    spacing: 'None',
                    text: `@[${username}](${userProfileUrl}) ${eventType}ed ${lowerCase(
                      toString(totalCommits),
                    )} commit${getSingleOrPlural(totalCommits)}`,
                    isSubtle: true,
                    wrap: true,
                  },
                ],
                width: 'stretch',
              },
            ],
          },
        ],
      },
      {
        type: 'Container',
        items: [
          {
            type: 'FactSet',
            spacing: 'None',
            facts: [
              {
                title: 'Branch:',
                value: branchName,
              },
              {
                title: 'Project:',
                value: `[${projectFullName}](${projectUrl})`,
              },
            ],
          },
          getCommitMessage(commits[0]),
        ],
      },
    ],
    actions,
  }
}
