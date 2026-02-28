import { ModifiedNextRequest, ModifiedNextResponse } from '../types/api';
import { NextResponse } from 'next/server';
import { loginService } from '../services/authService';
import { LoginDto } from '../dtos/Auth';

export const loginController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const body = await request.json() as LoginDto;
  const { provider, providerToken, email } = body;

  const result = await loginService(provider, providerToken, email);

  return NextResponse.json(result, { status: result.status });
};
