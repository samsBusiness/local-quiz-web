import { ModifiedNextRequest, ModifiedNextResponse, ModifiedNextMiddleware, ApiHandler, ApiRouteContextType } from '../types/api';

export const requestHandler = (
  handler: ApiHandler,
  middlewares: ModifiedNextMiddleware[] = []
) => {
  return async (request: ModifiedNextRequest, context: ApiRouteContextType): Promise<ModifiedNextResponse> => {
    try {
      // Execute middlewares in sequence
      for (const middleware of middlewares) {
        const result = await middleware(request, context, async () => {});
        
        // If middleware returns a response, stop execution and return it
        if (result && 'status' in result) {
          return result as ModifiedNextResponse;
        }
      }

      // Execute the main handler
      return await handler(request, context);
    } catch (error) {
      console.error('Request handler error:', error);
      return Response.json(
        { message: 'Internal server error' },
        { status: 500 }
      ) as ModifiedNextResponse;
    }
  };
};
