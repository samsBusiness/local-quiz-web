import { ModifiedNextRequest, ModifiedNextResponse } from '../types/api';
import { NextResponse } from 'next/server';
import { updateUserProfileService } from '../services/userService';
import { UpdateUserDto } from '../dtos/User';
import { ResolvedApiRouteContextType } from '../types/api';

export const updateUserController = async (
  request: ModifiedNextRequest,
  ctx: ResolvedApiRouteContextType
): Promise<ModifiedNextResponse> => {
  const { id } = ctx.params;
  const body = await request.json() as UpdateUserDto;

  const result = await updateUserProfileService(id, body);

  return NextResponse.json(result, { status: result.status });
};
