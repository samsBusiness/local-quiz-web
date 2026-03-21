import { Types } from 'mongoose';
import { Session, ISession } from '../models/Session';
import { ServiceResponseType } from '../types/api';

export const createSessionService = async (
  sessionData: {
    quizMaster: string;
    quiz: string;
    date: Date;
    attendees?: Array<{
      name: string;
      score: string;
      userId?: string;
    }>;
  }
): Promise<ServiceResponseType> => {
  try {
    const session = await Session.create(sessionData);

    return {
      status: 201,
      message: 'Session created successfully',
      data: {
        session: {
          _id: session._id,
          quizMaster: session.quizMaster,
          quiz: session.quiz,
          date: session.date,
          attendees: session.attendees,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Create session service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const getSessionsService = async (): Promise<ServiceResponseType> => {
  try {
    const sessions = await Session.find()
      .populate('quizMaster', 'name email')
      .populate('quiz', 'quizName quizCode')
      .sort({ date: -1 });

    return {
      status: 200,
      message: 'Sessions retrieved successfully',
      data: {
        sessions: sessions.map(session => ({
          _id: session._id,
          quizMaster: session.quizMaster,
          quiz: session.quiz,
          date: session.date,
          attendees: session.attendees,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }))
      }
    };
  } catch (error: unknown) {
    console.error('Get sessions service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const getSessionByIdService = async (sessionId: string): Promise<ServiceResponseType> => {
  try {
    const session = await Session.findById(sessionId)
      .populate('quizMaster', 'name email')
      .populate('quiz', 'quizName quizCode');

    if (!session) {
      return {
        status: 404,
        message: 'Session not found'
      };
    }

    return {
      status: 200,
      message: 'Session retrieved successfully',
      data: {
        session: {
          _id: session._id,
          quizMaster: session.quizMaster,
          quiz: session.quiz,
          date: session.date,
          attendees: session.attendees,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Get session by ID service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const updateSessionService = async (
  sessionId: string,
  updateData: {
    quizMaster?: string;
    quiz?: string;
    date?: Date;
    attendees?: Array<{
      name: string;
      score: string;
    }>;
  }
): Promise<ServiceResponseType> => {
  try {
    const session: ISession | null = await Session.findById(sessionId);

    if (!session) {
      return {
        status: 404,
        message: 'Session not found'
      };
    }

    // Update fields
    if (updateData.quizMaster !== undefined) session.quizMaster = new Types.ObjectId(updateData.quizMaster);
    if (updateData.quiz !== undefined) session.quiz = new Types.ObjectId(updateData.quiz);
    if (updateData.date !== undefined) session.date = updateData.date;
    if (updateData.attendees !== undefined) session.attendees = updateData.attendees;

    await session.save();

    return {
      status: 200,
      message: 'Session updated successfully',
      data: {
        session: {
          _id: session._id,
          quizMaster: session.quizMaster,
          quiz: session.quiz,
          date: session.date,
          attendees: session.attendees,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Update session service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const deleteSessionService = async (sessionId: string): Promise<ServiceResponseType> => {
  try {
    const session = await Session.findById(sessionId);

    if (!session) {
      return {
        status: 404,
        message: 'Session not found'
      };
    }

    await Session.findByIdAndDelete(sessionId);

    return {
      status: 200,
      message: 'Session deleted successfully',
      data: {
        session: {
          _id: session._id,
          quizMaster: session.quizMaster,
          quiz: session.quiz,
          date: session.date,
          attendees: session.attendees,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Delete session service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};
