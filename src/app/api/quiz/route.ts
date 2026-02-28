import { createQuizController, getQuizzesController } from '../../../../BE/controllers/quizController';
import { requestHandler } from '../../../../BE/utils/requestHandler';
import { connectDB, validate, checkAuth } from '../../../../BE/middlewares';
import { CreateQuizDto } from '../../../../BE/dtos/Quiz';

export const POST = requestHandler(createQuizController, [
  connectDB,
  checkAuth,
  validate(CreateQuizDto),
]);

export const GET = requestHandler(getQuizzesController, [
  connectDB,
]);
