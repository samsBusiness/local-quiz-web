import {
  ApiHandler,
  ApiRouteContextType,
  ResolvedApiRouteContextType,
  ModifiedNextMiddleware,
  ModifiedNextRequest,
  ModifiedNextResponse,
} from "../types";

export const requestHandler = (
  handler: ApiHandler,
  middlewares: ModifiedNextMiddleware[] = []
) => {
  return async (
    request: ModifiedNextRequest,
    ctx: ApiRouteContextType
  ): Promise<ModifiedNextResponse> => {
    try {
      let index = 0;

      const next = async (): Promise<void> => {
        if (index < middlewares.length) {
          const middleware = middlewares[index++];
          await middleware(request, ctx, next);
        }
      };

      await next();

      // Await params if it's a Promise
      const resolvedParams = await ctx.params;
      const resolvedCtx: ResolvedApiRouteContextType = {
        params: resolvedParams
      };

      return handler(request, resolvedCtx);
    } catch (error) {
      console.error("Request handler error:", error);
      const { NextResponse } = await import("next/server");
      return NextResponse.json(
        {
          status: 500,
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
};
