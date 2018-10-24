// libs
import { ChatConnector, UniversalBot, Message } from 'botbuilder'

const SKYPE_CREDENTIALS = {
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
}
const connector = new ChatConnector(SKYPE_CREDENTIALS)
const skypeBot = new UniversalBot(connector)

type SkypeAddress = {
  conversation: { id: string }
  bot: { id: string }
  serviceUrl: string
}

function getSkypeAddress(conversationId: string): SkypeAddress {
  return {
    conversation: { id: conversationId },
    bot: { id: process.env.MICROSOFT_APP_ID },
    serviceUrl: 'https://smba.trafficmanager.net/apis/',
  }
}

export function sendMessage(conversationId: string, messageString: string) {
  const address = getSkypeAddress(conversationId)
  const message = new Message().address(address)
  message.text(messageString)
  skypeBot.send(message)
}

export function sendMessageBySession(session: any, messageString: string) {
  session.send(messageString)
}
