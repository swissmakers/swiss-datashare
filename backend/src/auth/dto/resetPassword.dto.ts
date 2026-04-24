import { PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserDTO } from "@/user/dto/user.dto";

export class ResetPasswordDTO extends PickType(UserDTO, ["password"]) {
  @IsString()
  token: string;
}
