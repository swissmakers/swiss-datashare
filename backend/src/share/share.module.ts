import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ClamScanModule } from "@/clamscan/clamscan.module";
import { EmailModule } from "@/email/email.module";
import { FileModule } from "@/file/file.module";
import { ReverseShareModule } from "@/reverseShare/reverseShare.module";
import { ShareController } from "./share.controller";
import { ShareService } from "./share.service";

@Module({
  imports: [
    JwtModule.register({}),
    EmailModule,
    forwardRef(() => ClamScanModule),
    ReverseShareModule,
    forwardRef(() => FileModule),
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
