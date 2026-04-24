import { PickType } from "@nestjs/swagger";
import { UserDTO } from "@/user/dto/user.dto";

export class AuthRegisterDTO extends PickType(UserDTO, [
  "email",
  "username",
  "password",
] as const) {}
