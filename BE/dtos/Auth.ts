import "reflect-metadata";
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public provider!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public providerToken!: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  public email?: string;
}
