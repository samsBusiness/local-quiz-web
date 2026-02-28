import {NextRequest, NextResponse} from "next/server";
import {JwtPayload} from "jsonwebtoken";
import {USER_ROLES} from "./User";

export interface AuthData extends JwtPayload {
  _id: string;
  email: string;
  name: string;
  role: USER_ROLES;
}

export interface ModifiedNextRequest extends NextRequest {
  authData?: AuthData;
}

export type ResponseBody =
  | {
      message: string;
      data?: Record<string, unknown> | Record<string, unknown>[] | string | null;
    }
  | {
      message?: string;
      data: Record<string, unknown> | Record<string, unknown>[] | string | null;
    };

export type ModifiedNextResponse = NextResponse<ResponseBody>;

export type HTTPStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500; // Add other status codes as needed

export type ServiceResponseType = {status: HTTPStatus} & ResponseBody;

export type ApiRouteContextType = {
  params: Record<string, string> | undefined;
};

export type ApiHandler = (
  request: ModifiedNextRequest,
  ctx: ApiRouteContextType
) => Promise<ModifiedNextResponse>;

export type ModifiedNextMiddleware = (
  request: ModifiedNextRequest,
  ctx: ApiRouteContextType | undefined,
  next: () => Promise<void | ModifiedNextResponse>
) => Promise<void | ModifiedNextResponse>;
