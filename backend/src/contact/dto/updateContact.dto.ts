import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

const CONTACT_KINDS = ["person", "company"] as const;

export class UpdateContactDTO {
  @IsOptional()
  @IsString()
  @IsIn([...CONTACT_KINDS])
  kind?: (typeof CONTACT_KINDS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
