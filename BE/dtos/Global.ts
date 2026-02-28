import "reflect-metadata";
import { IsString, IsNotEmpty, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { USER_ROLES } from '../types/User';

export class WhitelistEntryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public name!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  public email!: string;

  @IsEnum(USER_ROLES)
  @IsNotEmpty()
  public role!: USER_ROLES;
}

export class UpdateWhitelistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhitelistEntryDto)
  public qmWhitelist!: WhitelistEntryDto[];
}

export class AddWhitelistEntryDto extends WhitelistEntryDto {}

export class GlobalResponseDto {
  public _id!: string;
  public qmWhitelist!: WhitelistEntryDto[];
  public createdAt!: Date;
  public updatedAt!: Date;
}
