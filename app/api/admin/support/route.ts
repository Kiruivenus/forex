import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();
  const conversations = await Conversation.find({}).sort({ lastMessageAt: -1 }).populate('userId', 'name email');

  return NextResponse.json({ success: true, conversations });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  try {
    const { conversationId, content, status } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json({ success: false, message: 'Conversation ID and reply content are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return NextResponse.json({ success: false, message: 'Conversation not found.' }, { status: 404 });
    }

    conv.lastMessageAt = new Date();
    if (status) {
      conv.status = status;
    } else {
      conv.status = 'PENDING';
    }
    await conv.save();

    const msg = await Message.create({
      conversationId: conv._id,
      senderId: auth.user.userId,
      senderRole: 'ADMIN',
      senderName: auth.user.name || 'Support Desk',
      content,
    });

    return NextResponse.json({ success: true, message: 'Support reply sent successfully.', reply: msg });
  } catch (error) {
    console.error('Admin Support Reply Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send support reply.' }, { status: 500 });
  }
}
