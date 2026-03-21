import { Global } from '../models/Global';
import { User, Quiz } from '../models/';
import { ServiceResponseType } from '../types/api';
import { USER_ROLES } from '../types/User';

export const getGlobalService = async (): Promise<ServiceResponseType> => {
  try {
    let globalData = await Global.findOne();
    
    // Create Global document if it doesn't exist
    if (!globalData) {
      globalData = await Global.create({ qmWhitelist: [] });
    }

    return {
      status: 200,
      message: 'Global data retrieved successfully',
      data: {
        global: {
          _id: globalData._id,
          qmWhitelist: globalData.qmWhitelist,
          createdAt: globalData.createdAt,
          updatedAt: globalData.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Get global service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};

export const updateGlobalService = async (
  whitelistData: Array<{
    name: string;
    email: string;
    role: USER_ROLES;
  }>
): Promise<ServiceResponseType> => {
  try {
    let globalData = await Global.findOne();
    
    // Create Global document if it doesn't exist
    if (!globalData) {
      globalData = await Global.create({ qmWhitelist: [] });
    }

    // Find removed emails
    const existingEmails = new Set(globalData.qmWhitelist.map((e) => e.email));
    const newEmails = new Set(whitelistData.map((e) => e.email));
    const removedEmails = [...existingEmails].filter((email) => !newEmails.has(email));

    // Block removal if any removed user has quizzes
    if (removedEmails.length > 0) {
      const users = await User.find({ email: { $in: removedEmails } }).select('_id email name');
      for (const user of users) {
        const quizCount = await Quiz.countDocuments({ createdBy: user._id });
        if (quizCount > 0) {
          return {
            status: 409,
            message: `Cannot remove ${user.name || user.email} — they have ${quizCount} quiz${quizCount > 1 ? 'zes' : ''} in the system.`,
          };
        }
      }
    }

    // Direct replacement - FE handles CRUD logic
    globalData.qmWhitelist = whitelistData;
    await globalData.save();

    return {
      status: 200,
      message: 'Global data updated successfully',
      data: {
        global: {
          _id: globalData._id,
          qmWhitelist: globalData.qmWhitelist,
          createdAt: globalData.createdAt,
          updatedAt: globalData.updatedAt
        }
      }
    };
  } catch (error: unknown) {
    console.error('Update global service error:', error);
    return {
      status: 500,
      message: 'Internal server error'
    };
  }
};
