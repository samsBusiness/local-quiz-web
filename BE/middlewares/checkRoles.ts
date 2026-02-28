import {NextResponse} from "next/server";
import {ModifiedNextMiddleware, USER_ROLES} from "../types";

export const checkQM: ModifiedNextMiddleware = async (
  request,
  _ctx,
  next
) => {
  const {authData} = request;

  if (authData?.role !== USER_ROLES.QM)
    return NextResponse.json({message: "user not authorized"}, {status: 401});
  return await next();
};

export const checkSuperAdmin: ModifiedNextMiddleware = async (
  request,
  _ctx,
  next
) => {
  const {authData} = request;

  if (authData?.role !== USER_ROLES.SUPER_ADMIN)
    return NextResponse.json({message: "user not authorized"}, {status: 401});
  return next();
};
