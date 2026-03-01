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
      let middlewareResponse: ModifiedNextResponse | null = null;

      const next = async (): Promise<void> => {
        if (index < middlewares.length) {
          const middleware = middlewares[index++];
          const result = await middleware(request, ctx, next);
          
          // If middleware returns a response, capture it and stop the chain
          if (result) {
            middlewareResponse = result;
          }
        }
      };

      await next();

      // If any middleware returned a response, return it immediately
      if (middlewareResponse) {
        return middlewareResponse;
      }

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
