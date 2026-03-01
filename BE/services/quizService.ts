import { Quiz } from "../models/";
import { ServiceResponseType } from "../types/api";
import { CreateQuizDto, UpdateQuizDto, QuestionDto } from "../dtos/Quiz";
import { v4 as uuidv4 } from "uuid";
import { IQuestion, IQuiz } from "../models/Quiz";

// Interface for quiz with question IDs (for frontend)
interface IQuizWithIds extends IPlainQuiz {
  questions: (IQuestion & { id: string })[];
}

// Interface for plain quiz object (from toObject)
interface IPlainQuiz {
  _id: string;
  quizName: string;
  quizCode: string;
  timeLimit: number;
  description: string;
  questions: IQuestion[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// Helper to add IDs to questions for frontend
function addQuestionIds(
  questions: IQuestion[],
): (IQuestion & { id: string })[] {
  return questions.map((q) => ({
    ...q,
    id: uuidv4(),
  }));
}

// Helper to remove IDs from questions before saving
function removeQuestionIds(questions: QuestionDto[]): IQuestion[] {
  return questions.map(({ question, options, correctOption, points }) => ({
    question,
    options,
    correctOption,
    points,
  }));
}

// Helper to convert quiz to plain object and add question IDs
function quizToPlainWithIds(quiz: IQuiz): IQuizWithIds {
  const plainQuiz = quiz.toObject() as IPlainQuiz;
  return {
    ...plainQuiz,
    questions: addQuestionIds(plainQuiz.questions),
  };
}

export const createQuizService = async (
  quizData: CreateQuizDto,
  createdBy: string,
): Promise<ServiceResponseType> => {
  try {
    const quiz = await Quiz.create({
      ...quizData,
      questions: removeQuestionIds(quizData.questions),
      createdBy,
    });

    return {
      status: 201,
      message: "Quiz created successfully",
      data: {
        quiz: quizToPlainWithIds(quiz),
      },
    };
  } catch (error: unknown) {
    console.error("Create quiz service error:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const getQuizzesService = async (): Promise<ServiceResponseType> => {
  try {
    const quizzes = (await Quiz.find()
      .populate("createdBy")
      .lean()
      .sort({ createdAt: -1 })) as IPlainQuiz[];

    return {
      status: 200,
      message: "Quizzes retrieved successfully",
      data: {
        quizzes: quizzes.map((quiz) => ({
          ...quiz,
          questions: addQuestionIds(quiz.questions || []),
        })),
      },
    };
  } catch (error: unknown) {
    console.error("Get quizzes service error:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const getQuizByIdService = async (
  quizId: string,
): Promise<ServiceResponseType> => {
  try {
    const quiz = (await Quiz.findById(quizId).lean()) as IPlainQuiz | null;

    if (!quiz) {
      return {
        status: 404,
        message: "Quiz not found",
      };
    }

    return {
      status: 200,
      message: "Quiz retrieved successfully",
      data: {
        quiz: {
          ...quiz,
          questions: addQuestionIds(quiz.questions || []),
        },
      },
    };
  } catch (error: unknown) {
    console.error("Get quiz by ID service error:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const updateQuizService = async (
  quizId: string,
  updateData: UpdateQuizDto,
): Promise<ServiceResponseType> => {
  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return {
        status: 404,
        message: "Quiz not found",
      };
    }

    // Update fields
    if (updateData.quizName !== undefined) quiz.quizName = updateData.quizName;
    if (updateData.quizCode !== undefined) quiz.quizCode = updateData.quizCode;
    if (updateData.timeLimit !== undefined)
      quiz.timeLimit = updateData.timeLimit;
    if (updateData.description !== undefined)
      quiz.description = updateData.description;
    if (updateData.questions !== undefined)
      quiz.questions = removeQuestionIds(updateData.questions);

    await quiz.save();

    return {
      status: 200,
      message: "Quiz updated successfully",
      data: {
        quiz: quizToPlainWithIds(quiz),
      },
    };
  } catch (error: unknown) {
    console.error("Update quiz service error:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const deleteQuizService = async (
  quizId: string,
): Promise<ServiceResponseType> => {
  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return {
        status: 404,
        message: "Quiz not found",
      };
    }

    await Quiz.findByIdAndDelete(quizId);

    return {
      status: 200,
      message: "Quiz deleted successfully",
      data: {
        quiz: {
          _id: quiz._id,
          quizName: quiz.quizName,
          quizCode: quiz.quizCode,
          timeLimit: quiz.timeLimit,
          description: quiz.description,
          questions: quiz.questions,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Delete quiz service error:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};
