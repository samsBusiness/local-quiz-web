import { Global, IGlobal } from '../models/Global';
import { USER_ROLES } from '../types/User';

export const seedGlobalData = async (): Promise<void> => {
  try {
    // Check if Global document already exists
    const existingGlobal = await Global.findOne();
    
    if (!existingGlobal) {
      // Create initial Global document with whitelist
      const globalData: Partial<IGlobal> = {
        qmWhitelist: [
          {
            name: "Huzaifa K",
            email: "hikothari128@gmail.com",
            role: USER_ROLES.SUPER_ADMIN
          }
        ]
      };

      await Global.create(globalData);
      
      console.log('✅ Global data seeded successfully');
    } else {
      console.log('ℹ️ Global data already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding global data:', error);
  }
};
