import { getSessionByIdController, updateSessionController, deleteSessionController } from '../../../../../BE/controllers/sessionController';
import { requestHandler } from '../../../../../BE/utils/requestHandler';
import { connectDB, validate, checkAuth } from '../../../../../BE/middlewares';
import { UpdateSessionDto } from '../../../../../BE/dtos/Session';

export const GET = requestHandler(
  (request, context) => getSessionByIdController(request, context as { params: { id: string } }),
  [
    connectDB,
  ]
);

export const PUT = requestHandler(
  (request, context) => updateSessionController(request, context as { params: { id: string } }),
  [
    connectDB,
    checkAuth,
    validate(UpdateSessionDto),
  ]
);

export const DELETE = requestHandler(
  (request, context) => deleteSessionController(request, context as { params: { id: string } }),
  [
    connectDB,
    checkAuth,
  ]
);
