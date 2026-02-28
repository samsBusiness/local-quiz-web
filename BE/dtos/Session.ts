import "reflect-metadata";
import { IsString, IsOptional, IsArray, IsBoolean, IsMongoId, IsDate, IsNotEmpty, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AttendeeDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public name!: string;

  @IsString()
  @IsNotEmpty()
  public score!: string;
}

export class CreateSessionDto {
  @IsMongoId()
  @IsNotEmpty()
  public quizMaster!: string;

  @IsMongoId()
  @IsNotEmpty()
  public quiz!: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  public date!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeDto)
  @IsOptional()
  public attendees?: AttendeeDto[];

  @IsBoolean()
  @IsOptional()
  public isActive?: boolean;
}

export class UpdateSessionDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  public date?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeDto)
  @IsOptional()
  public attendees?: AttendeeDto[];

  @IsBoolean()
  @IsOptional()
  public isActive?: boolean;
}

export class SessionResponseDto {
  public _id!: string;
  public quizMaster!: string;
  public quiz!: string;
  public date!: Date;
  public attendees!: AttendeeDto[];
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}
