import { NextResponse } from 'next/server';
import { connectDB } from '../../../../BE/middlewares';
import { seedGlobalData } from '../../../../BE/utils/seedData';
import { ModifiedNextRequest } from '../../../../BE/types/api';

export const POST = async () => {
  try {
    // Connect to database
    await connectDB({} as ModifiedNextRequest, undefined, async () => {});
    
    // Seed the global data
    await seedGlobalData();
    
    return NextResponse.json({
      status: 200,
      message: 'Database initialized and seed data created successfully'
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json({
      status: 500,
      message: 'Initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
