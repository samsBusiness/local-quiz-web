import "reflect-metadata";
import { IsString, IsNumber, IsOptional, IsArray, Min, IsNotEmpty, ValidateNested, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public id!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public question!: string;

  @IsArray()
  @IsString({ each: true })
  public options!: string[];

  @IsNumber()
  @Min(0)
  public correctOption!: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  public points?: number;
}

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public quizName!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toUpperCase())
  public quizCode!: string;

  @IsNumber()
  @Min(1)
  public timeLimit!: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  public description!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  public questions!: QuestionDto[];

  @IsMongoId()
  @IsNotEmpty()
  public createdBy!: string;
}

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  public quizName?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toUpperCase())
  public quizCode?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  public timeLimit?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  public description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  public questions?: QuestionDto[];
}

export class QuizResponseDto {
  public _id!: string;
  public quizName!: string;
  public quizCode!: string;
  public timeLimit!: number;
  public description!: string;
  public questions!: QuestionDto[];
  public createdBy!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}
