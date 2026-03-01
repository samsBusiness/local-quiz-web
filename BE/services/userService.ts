import { User } from "../models/";
import { ServiceResponseType } from "../types/api";

export const updateUserProfileService = async (
  userId: string,
  updateData: { name?: string }
): Promise<ServiceResponseType> => {
  try {
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        status: 404,
        message: 'User not found'
      };
    }

    // Update user fields
    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }

    await user.save();

    return {
      status: 200,
      message: 'User updated successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          providers: user.providers,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    };

  } catch (error: unknown) {
    console.error('Update user service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};
