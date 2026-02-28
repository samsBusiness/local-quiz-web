import { getQuizByIdController, updateQuizController, deleteQuizController } from '../../../../../BE/controllers/quizController';
import { requestHandler } from '../../../../../BE/utils/requestHandler';
import { connectDB, validate, checkAuth } from '../../../../../BE/middlewares';
import { UpdateQuizDto } from '../../../../../BE/dtos/Quiz';

export const GET = requestHandler(
  (request, context) => getQuizByIdController(request, context as { params: { id: string } }),
  [
    connectDB,
  ]
);

export const PUT = requestHandler(
  (request, context) => updateQuizController(request, context as { params: { id: string } }),
  [
    connectDB,
    checkAuth,
    validate(UpdateQuizDto),
  ]
);

export const DELETE = requestHandler(
  (request, context) => deleteQuizController(request, context as { params: { id: string } }),
  [
    connectDB,
    checkAuth,
  ]
);
