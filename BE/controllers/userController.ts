import { ModifiedNextRequest, ModifiedNextResponse } from '../types/api';
import { NextResponse } from 'next/server';
import { updateUserProfileService } from '../services/userService';
import { UpdateUserDto } from '../dtos/User';

export const updateUserController = async (
  request: ModifiedNextRequest,
  { params }: { params: { id: string } }
): Promise<ModifiedNextResponse> => {
  const { id } = params;
  const body = await request.json() as UpdateUserDto;

  const result = await updateUserProfileService(id, body);

  return NextResponse.json(result, { status: result.status });
};
