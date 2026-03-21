import { ModifiedNextRequest, ModifiedNextResponse } from '../types/api';
import { NextResponse } from 'next/server';
import {
  createSessionService,
  getSessionsService,
  getSessionByIdService,
  updateSessionService,
  deleteSessionService
} from '../services/sessionService';
import { CreateSessionDto, UpdateSessionDto } from '../dtos/Session';
import { ResolvedApiRouteContextType } from '../types/api';

export const createSessionController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const body = await request.json() as CreateSessionDto;

  const validatedBody = {
    ...body,
    attendees: body.attendees?.filter(
      (attendee): attendee is { name: string; score: string; userId: string } =>
        attendee.userId !== undefined
    ),
  };

  const result = await createSessionService(validatedBody);

  return NextResponse.json(result, { status: result.status });
};

export const getSessionsController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const result = await getSessionsService();

  return NextResponse.json(result, { status: result.status });
};

export const getSessionByIdController = async (
  request: ModifiedNextRequest,
  ctx: ResolvedApiRouteContextType
): Promise<ModifiedNextResponse> => {
  const { id } = ctx.params;

  const result = await getSessionByIdService(id);

  return NextResponse.json(result, { status: result.status });
};

export const updateSessionController = async (
  request: ModifiedNextRequest,
  ctx: ResolvedApiRouteContextType
): Promise<ModifiedNextResponse> => {
  const { id } = ctx.params;
  const body = await request.json() as UpdateSessionDto;

  const result = await updateSessionService(id, body);

  return NextResponse.json(result, { status: result.status });
};

export const deleteSessionController = async (
  request: ModifiedNextRequest,
  ctx: ResolvedApiRouteContextType
): Promise<ModifiedNextResponse> => {
  const { id } = ctx.params;

  const result = await deleteSessionService(id);

  return NextResponse.json(result, { status: result.status });
};
