import {
  ActivityTypes,
  ConversationState,
  StatePropertyAccessor,
  TurnContext,
} from 'botbuilder'

// Turn counter property
const TURN_COUNTER = 'turnCounterProperty'

export function getBotTurnController(conversationState: ConversationState) {
  const countAccessor: StatePropertyAccessor<
    number
  > = conversationState.createProperty(TURN_COUNTER)

  return async (turnContext: TurnContext) => {
    // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
    // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
    // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
    if (turnContext.activity.type === ActivityTypes.Message) {
      console.log(turnContext.activity.text)

      // read from state.
      let count = await countAccessor.get(turnContext)
      count = count === undefined ? 1 : ++count

      await turnContext.sendActivity(
        `${count}: You said "${turnContext.activity.text}"`,
      )
      // increment and set turn counter.
      await countAccessor.set(turnContext, count)
    }
    // Save state changes
    await conversationState.saveChanges(turnContext)
  }
}
