import User, { IUser } from '../models/User';
import Global, { IWhitelistEntry } from '../models/Global';
import { sign } from 'jsonwebtoken';
import { ServiceResponseType } from '../types/api';
import { USER_ROLES } from '../types/User';

export const loginService = async (
  provider: string,
  providerToken: string,
  email?: string
): Promise<ServiceResponseType> => {
  try {
    // Check if email is provided and get whitelist data
    if (!email) {
      return {
        status: 400,
        message: 'Email is required'
      };
    }

    // Get whitelist data
    const globalData = await Global.findOne();
    if (!globalData || !globalData.qmWhitelist) {
      return {
        status: 500,
        message: 'Whitelist not configured'
      };
    }

    // Check if email is in whitelist
    const whitelistEntry = globalData.qmWhitelist.find(
      entry => entry.email.toLowerCase() === email.toLowerCase()
    );

    if (!whitelistEntry) {
      return {
        status: 403,
        message: 'Email not whitelisted'
      };
    }

    // Find user by email
    let user: IUser | null = await User.findOne({ email: email.toLowerCase() });

    // If user doesn't exist, create new user with whitelist data
    if (!user) {
      const newProvider = {
        type: provider,
        providerId: providerToken
      };

      user = new User({
        email: email.toLowerCase(),
        name: whitelistEntry.name,
        role: whitelistEntry.role,
        providers: [newProvider]
      });

      await user.save();
    }
    // If user exists, check provider logic
    else {
      const existingProvider = user.providers?.find(
        p => p.type === provider
      );

      // If provider type exists, validate the token
      if (existingProvider) {
        if (existingProvider.providerId !== providerToken) {
          return {
            status: 401,
            message: 'Provider authentication failed'
          };
        }
      }
      // If provider type doesn't exist, add it to the providers list
      else {
        const newProvider = {
          type: provider,
          providerId: providerToken
        };
        
        if (!user.providers) {
          user.providers = [];
        }
        user.providers.push(newProvider);
        await user.save();
      }
    }

    // Generate JWT token with role
    const token = sign(
      {
        _id: user!._id,
        email: user!.email,
        name: user!.name,
        role: user!.role
      },
      process.env.ACCESS_TOKEN_SALT || 'fallback-secret',
      {} // No expiration as requested
    );

    return {
      status: 200,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user!._id,
          email: user!.email,
          name: user!.name,
          role: user!.role,
          providers: user!.providers
        }
      }
    };

  } catch (error: unknown) {
    console.error('Login service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};
