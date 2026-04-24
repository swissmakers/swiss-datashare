import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "@prisma/client";
import { SkipThrottle } from "@nestjs/throttler";
import { GetUser } from "@/auth/decorator/getUser.decorator";
import { AdministratorGuard } from "@/auth/guard/isAdmin.guard";
import { JwtGuard } from "@/auth/guard/jwt.guard";
import { EmailService } from "@/email/email.service";
import { ConfigService } from "./config.service";
import { AdminConfigDTO } from "./dto/adminConfig.dto";
import { ConfigDTO } from "./dto/config.dto";
import { TestEmailDTO } from "./dto/testEmail.dto";
import UpdateConfigDTO from "./dto/updateConfig.dto";
import { LogoService } from "./logo.service";

@Controller("configs")
export class ConfigController {
  constructor(
    private configService: ConfigService,
    private logoService: LogoService,
    private emailService: EmailService,
  ) {}

  @Get()
  @SkipThrottle()
  async list() {
    return new ConfigDTO().fromList(await this.configService.list());
  }

  @Get("admin/:category")
  @UseGuards(JwtGuard, AdministratorGuard)
  async getByCategory(@Param("category") category: string) {
    return new AdminConfigDTO().fromList(
      await this.configService.getByCategory(category),
    );
  }

  @Patch("admin")
  @UseGuards(JwtGuard, AdministratorGuard)
  async updateMany(@Body() data: UpdateConfigDTO[]) {
    return new AdminConfigDTO().fromList(
      await this.configService.updateMany(data),
    );
  }

  @Post("admin/email/resetTranslations")
  @UseGuards(JwtGuard, AdministratorGuard)
  async resetEmailTranslations() {
    return new AdminConfigDTO().fromList(
      await this.configService.resetEmailTranslationsToDefault(),
    );
  }

  @Post("admin/legal/resetTranslations")
  @UseGuards(JwtGuard, AdministratorGuard)
  async resetLegalTranslations() {
    return new AdminConfigDTO().fromList(
      await this.configService.resetLegalTranslationsToDefault(),
    );
  }

  @Post("admin/testEmail")
  @UseGuards(JwtGuard, AdministratorGuard)
  async testEmail(@Body() { email }: TestEmailDTO, @GetUser() user: User) {
    await this.emailService.sendTestMail(
      email,
      (user as { locale?: string })?.locale,
    );
  }

  @Post("admin/logo")
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(JwtGuard, AdministratorGuard)
  async uploadLogo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: "image/png" })],
      }),
    )
    file: { buffer: Buffer },
  ) {
    return await this.logoService.create(file.buffer);
  }
}
