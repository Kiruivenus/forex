import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
