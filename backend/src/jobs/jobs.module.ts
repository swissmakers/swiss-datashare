import { Module } from "@nestjs/common";
import { FileModule } from "@/file/file.module";
import { ReverseShareModule } from "@/reverseShare/reverseShare.module";
import { JobsService } from "./jobs.service";

@Module({
  imports: [FileModule, ReverseShareModule],
  providers: [JobsService],
})
export class JobsModule {}
