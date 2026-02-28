import mongoose from "mongoose";
import {ModifiedNextMiddleware} from "../types";
import {NextResponse} from "next/server";

const uri = process.env.MONGODB_URI || "";
let connection: mongoose.Mongoose;

export const connectDB: ModifiedNextMiddleware = async (
  _request,
  _ctx,
  next
) => {
  try {
    console.log("Connecting to MongoDB");
    if (!connection) {
      connection = await mongoose.connect(uri, {
        dbName: process.env.DB_NAME || "",
      });
      if (connection.connection.readyState === 1)
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    }
    return await next();
  } catch (error: unknown) {
    return NextResponse.json({message: (error as Error).message}, {status: 500});
  }
};

process.on("SIGINT", async () => {
  if (connection) {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});
