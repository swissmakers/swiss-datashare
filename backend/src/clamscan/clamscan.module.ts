import { forwardRef, Module } from "@nestjs/common";
import { FileModule } from "@/file/file.module";
import { ClamScanService } from "./clamscan.service";

@Module({
  imports: [forwardRef(() => FileModule)],
  providers: [ClamScanService],
  exports: [ClamScanService],
})
export class ClamScanModule {}
