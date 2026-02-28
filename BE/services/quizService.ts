import Quiz, { IQuiz } from '../models/Quiz';
import { ServiceResponseType } from '../types/api';

export const createQuizService = async (
  quizData: {
    quizName: string;
    quizCode: string;
    timeLimit: number;
    description: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctOption: number;
      points?: number;
    }>;
  }
): Promise<ServiceResponseType> => {
  try {
    const quiz = new Quiz(quizData);
    await quiz.save();

    return {
      status: 201,
      message: 'Quiz created successfully',
      data: {
        quiz: {
          _id: quiz._id,
          quizName: quiz.quizName,
          quizCode: quiz.quizCode,
          timeLimit: quiz.timeLimit,
          description: quiz.description,
          questions: quiz.questions,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Create quiz service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const getQuizzesService = async (): Promise<ServiceResponseType> => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });

    return {
      status: 200,
      message: 'Quizzes retrieved successfully',
      data: {
        quizzes: quizzes.map(quiz => ({
          _id: quiz._id,
          quizName: quiz.quizName,
          quizCode: quiz.quizCode,
          timeLimit: quiz.timeLimit,
          description: quiz.description,
          questions: quiz.questions,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }))
      }
    };
  } catch (error: unknown) {
    console.error('Get quizzes service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const getQuizByIdService = async (quizId: string): Promise<ServiceResponseType> => {
  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return {
        status: 404,
        message: 'Quiz not found'
      };
    }

    return {
      status: 200,
      message: 'Quiz retrieved successfully',
      data: {
        quiz: {
          _id: quiz._id,
          quizName: quiz.quizName,
          quizCode: quiz.quizCode,
          timeLimit: quiz.timeLimit,
          description: quiz.description,
          questions: quiz.questions,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Get quiz by ID service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const updateQuizService = async (
  quizId: string,
  updateData: {
    quizName?: string;
    quizCode?: string;
    timeLimit?: number;
    description?: string;
    questions?: Array<{
      id: string;
      question: string;
      options: string[];
      correctOption: number;
      points?: number;
    }>;
  }
): Promise<ServiceResponseType> => {
  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return {
        status: 404,
        message: 'Quiz not found'
      };
    }

    // Update fields
    if (updateData.quizName !== undefined) quiz.quizName = updateData.quizName;
    if (updateData.quizCode !== undefined) quiz.quizCode = updateData.quizCode;
    if (updateData.timeLimit !== undefined) quiz.timeLimit = updateData.timeLimit;
    if (updateData.description !== undefined) quiz.description = updateData.description;
    if (updateData.questions !== undefined) quiz.questions = updateData.questions;

    await quiz.save();

    return {
      status: 200,
      message: 'Quiz updated successfully',
      data: {
        quiz: {
          _id: quiz._id,
          quizName: quiz.quizName,
          quizCode: quiz.quizCode,
          timeLimit: quiz.timeLimit,
          description: quiz.description,
          questions: quiz.questions,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Update quiz service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const deleteQuizService = async (quizId: string): Promise<ServiceResponseType> => {
  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return {
        status: 404,
        message: 'Quiz not found'
      };
    }

    await Quiz.findByIdAndDelete(quizId);

    return {
      status: 200,
      message: 'Quiz deleted successfully',
      data: {
        quiz: {
          _id: quiz._id,
          quizName: quiz.quizName,
          quizCode: quiz.quizCode,
          timeLimit: quiz.timeLimit,
          description: quiz.description,
          questions: quiz.questions,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Delete quiz service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};
