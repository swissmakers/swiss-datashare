import { PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserDTO } from "@/user/dto/user.dto";

export class VerifyTotpDTO extends PickType(UserDTO, ["password"] as const) {
  @IsString()
  code: string;
}
