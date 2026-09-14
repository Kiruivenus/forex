import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHelpArticle extends Document {
  title: string;
  slug: string;
  category: 'ACCOUNT' | 'DEPOSITS' | 'WITHDRAWALS' | 'TRADING' | 'VERIFICATION' | 'SECURITY' | 'PAYMENTS' | 'AI_SCANNER';
  content: string;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const HelpArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['ACCOUNT', 'DEPOSITS', 'WITHDRAWALS', 'TRADING', 'VERIFICATION', 'SECURITY', 'PAYMENTS', 'AI_SCANNER'],
      required: true,
      index: true,
    },
    content: { type: String, required: true },
    isPublished: { type: Boolean, default: true, index: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const HelpArticle: Model<IHelpArticle> =
  mongoose.models.HelpArticle || mongoose.model<IHelpArticle>('HelpArticle', HelpArticleSchema);
export default HelpArticle;
