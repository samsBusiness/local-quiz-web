import { updateUserController } from '../../../../../BE/controllers/userController';
import { requestHandler } from '../../../../../BE/utils/requestHandler';
import { connectDB, validate } from '../../../../../BE/middlewares';
import { UpdateUserDto } from '../../../../../BE/dtos/User';

export const PUT = requestHandler(
  (request, context) => updateUserController(request, context as { params: { id: string } }),
  [
    connectDB,
    validate(UpdateUserDto),
  ]
);
