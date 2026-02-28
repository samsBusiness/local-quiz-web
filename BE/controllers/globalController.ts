import { ModifiedNextRequest, ModifiedNextResponse } from '../types/api';
import { NextResponse } from 'next/server';
import {
  getGlobalService,
  updateGlobalService
} from '../services/globalService';
import { UpdateWhitelistDto } from '../dtos/Global';

export const getGlobalController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const result = await getGlobalService();

  return NextResponse.json(result, { status: result.status });
};

export const updateGlobalController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const body = await request.json() as UpdateWhitelistDto;

  const result = await updateGlobalService(body.qmWhitelist);

  return NextResponse.json(result, { status: result.status });
};
