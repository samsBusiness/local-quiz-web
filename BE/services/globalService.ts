import { Global } from '../models/Global';
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
