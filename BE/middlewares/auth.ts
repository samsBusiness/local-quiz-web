import {headers} from "next/headers";
import {AuthData, ModifiedNextMiddleware } from "../types";
import {NextResponse} from "next/server";
import {Secret, verify} from "jsonwebtoken";

export const checkAuth: ModifiedNextMiddleware = async (
  request,
  _ctx,
  next
) => {
  const headerList = await headers();
  let authorization =
    headerList.get("authorization") || request.cookies?.get("jwtToken")?.value;

  if (!authorization)
    return NextResponse.json(
      {message: "user not authenticated"},
      {status: 401}
    );

  if (authorization.startsWith("Bearer ")) {
    authorization = authorization.slice(7);
  }
  try {
    const tokenData = verify(
      authorization,
      process.env.ACCESS_TOKEN_SALT as Secret
    );
    request.authData = tokenData as AuthData;
    return await next();
  } catch (error: unknown) {
    return (error as Error).name === "TokenExpiredError"
      ? NextResponse.json({message: "user session has expired"}, {status: 403})
      : NextResponse.json({message: "user not authenticated"}, {status: 401});
  }
};
