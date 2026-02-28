import { ModifiedNextRequest, ModifiedNextResponse } from '../types/api';
import { NextResponse } from 'next/server';
import {
  createQuizService,
  getQuizzesService,
  getQuizByIdService,
  updateQuizService,
  deleteQuizService
} from '../services/quizService';
import { CreateQuizDto, UpdateQuizDto } from '../dtos/Quiz';

export const createQuizController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const body = await request.json() as CreateQuizDto;

  const result = await createQuizService(body);

  return NextResponse.json(result, { status: result.status });
};

export const getQuizzesController = async (
  request: ModifiedNextRequest
): Promise<ModifiedNextResponse> => {
  const result = await getQuizzesService();

  return NextResponse.json(result, { status: result.status });
};

export const getQuizByIdController = async (
  request: ModifiedNextRequest,
  { params }: { params: { id: string } }
): Promise<ModifiedNextResponse> => {
  const { id } = params;

  const result = await getQuizByIdService(id);

  return NextResponse.json(result, { status: result.status });
};

export const updateQuizController = async (
  request: ModifiedNextRequest,
  { params }: { params: { id: string } }
): Promise<ModifiedNextResponse> => {
  const { id } = params;
  const body = await request.json() as UpdateQuizDto;

  const result = await updateQuizService(id, body);

  return NextResponse.json(result, { status: result.status });
};

export const deleteQuizController = async (
  request: ModifiedNextRequest,
  { params }: { params: { id: string } }
): Promise<ModifiedNextResponse> => {
  const { id } = params;

  const result = await deleteQuizService(id);

  return NextResponse.json(result, { status: result.status });
};
