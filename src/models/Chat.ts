import mongoose from 'mongoose';

// TODO: Add encryption for Tokens like User Model. Need to answer how to decrypt when retrieving the model

export type Subscription = {
  url: string,
  name: string,
}

export type Chat = mongoose.Document & {
  chatId: string,
  platformType: string,
  accessToken: string,
  refreshToken: string,
  subscriptions: Subscription[],
}

const chatSchema = new mongoose.Schema({
  chatId: String,
  platformType: String,
  accessToken: String,
  refreshToken: String,
  subscriptions: Array,
}, { timestamps: true })

export const Chat = mongoose.model<Chat>('Chat', chatSchema)

export default Chat
