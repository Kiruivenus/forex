import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  const conversations = await Conversation.find({ userId: auth.user.userId }).sort({ lastMessageAt: -1 });

  return NextResponse.json({ success: true, conversations });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { conversationId, subject, content } = await req.json();

    if (!content) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    await connectToDatabase();

    let conv;
    if (conversationId) {
      conv = await Conversation.findOne({ _id: conversationId, userId: auth.user.userId });
    }

    if (!conv) {
      conv = await Conversation.create({
        userId: auth.user.userId,
        subject: subject || 'Support Inquiry',
        status: 'OPEN',
        lastMessageAt: new Date(),
      });
    } else {
      conv.lastMessageAt = new Date();
      conv.status = 'OPEN';
      await conv.save();
    }

    const msg = await Message.create({
      conversationId: conv._id,
      senderId: auth.user.userId,
      senderRole: 'USER',
      senderName: auth.user.name,
      content,
    });

    return NextResponse.json({ success: true, conversation: conv, message: msg });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message.' }, { status: 500 });
  }
}
