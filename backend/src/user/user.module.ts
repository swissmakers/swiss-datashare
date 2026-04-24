import { Module } from "@nestjs/common";
import { EmailModule } from "@/email/email.module";
import { UserController } from "./user.controller";
import { UserSevice } from "./user.service";
import { FileModule } from "@/file/file.module";

@Module({
  imports: [EmailModule, FileModule],
  providers: [UserSevice],
  controllers: [UserController],
  exports: [UserSevice],
})
export class UserModule {}
