import { getGlobalController, updateGlobalController } from '../../../../BE/controllers/globalController';
import { requestHandler } from '../../../../BE/utils/requestHandler';
import { connectDB, validate, checkAuth, checkSuperAdmin } from '../../../../BE/middlewares';
import { UpdateWhitelistDto } from '../../../../BE/dtos/Global';

export const GET = requestHandler(getGlobalController, [
  connectDB,
  checkAuth,
  checkSuperAdmin,
]);

export const PUT = requestHandler(updateGlobalController, [
  connectDB,
  checkAuth,
  checkSuperAdmin,
  validate(UpdateWhitelistDto),
]);
