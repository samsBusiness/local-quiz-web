import {plainToInstance, ClassConstructor} from 'class-transformer';
import {ModifiedNextMiddleware} from "../types";
import {validateOrReject} from 'class-validator';
import {NextResponse} from 'next/server';

export const validate =
  (ValidationDto: ClassConstructor<unknown>): ModifiedNextMiddleware =>
  async (request, _ctx, next) => {
    const reqBody = await request.json();
    const data = plainToInstance(ValidationDto, reqBody) as object;
    try {
      await validateOrReject(data);
      request.json = () =>
        new Promise((resolve) => {
          resolve(data);
        });
    } catch (err) {
      return NextResponse.json(
        {message: "Request body is incorrect"},
        {status: 400}
      );
    }
    return next();
  };
