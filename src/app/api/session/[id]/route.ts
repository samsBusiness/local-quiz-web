import { getSessionByIdController, updateSessionController, deleteSessionController } from '../../../../../BE/controllers/sessionController';
import { requestHandler } from '../../../../../BE/utils/requestHandler';
import { connectDB, validate, checkAuth } from '../../../../../BE/middlewares';
import { UpdateSessionDto } from '../../../../../BE/dtos/Session';

export const GET = requestHandler(getSessionByIdController, [
  connectDB,
]);

export const PUT = requestHandler(updateSessionController, [
  connectDB,
  checkAuth,
  validate(UpdateSessionDto),
]);

export const DELETE = requestHandler(deleteSessionController, [
  connectDB,
  checkAuth,
]);
