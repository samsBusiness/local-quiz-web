import { createSessionController, getSessionsController } from '../../../../BE/controllers/sessionController';
import { requestHandler } from '../../../../BE/utils/requestHandler';
import { connectDB, validate, checkAuth } from '../../../../BE/middlewares';
import { CreateSessionDto } from '../../../../BE/dtos/Session';

export const POST = requestHandler(createSessionController, [
  connectDB,
  checkAuth,
  validate(CreateSessionDto),
]);

export const GET = requestHandler(getSessionsController, [
  connectDB,
]);
