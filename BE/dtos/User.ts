import "reflect-metadata";
import {
  IsString,
  IsOptional,
} from "class-validator";
import { Transform } from "class-transformer";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  public name?: string;
}
