import { loginController } from '../../../../BE/controllers/authController';
import { requestHandler } from '../../../../BE/utils/requestHandler';
import { connectDB, validate } from '../../../../BE/middlewares';
import { LoginDto } from '../../../../BE/dtos/Auth';

export const POST = requestHandler(loginController, [
  connectDB,
  validate(LoginDto),
]);
