import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { Request } from "express";
import { GetUser } from "@/auth/decorator/getUser.decorator";
import { JwtGuard } from "@/auth/guard/jwt.guard";
import { AdministratorGuard } from "@/auth/guard/isAdmin.guard";
import { CreateCheckoutSessionDTO } from "./dto/createCheckoutSession.dto";
import { SaasBillingStatusDTO } from "./dto/saasBillingStatus.dto";
import { SaasService } from "./saas.service";

@Controller("saas")
export class SaasController {
  constructor(private saasService: SaasService) {}

  @Get("status")
  @UseGuards(JwtGuard)
  async getStatus(@GetUser() user: User) {
    return new SaasBillingStatusDTO().from(
      await this.saasService.getBillingStatus(user.id),
    );
  }

  @Post("checkout-session")
  @UseGuards(JwtGuard)
  async createCheckoutSession(
    @GetUser() user: User,
    @Body() dto: CreateCheckoutSessionDTO,
  ) {
    return this.saasService.createCheckoutSession(user.id, dto.interval);
  }

  @Post("billing-portal")
  @UseGuards(JwtGuard)
  async createBillingPortal(@GetUser() user: User) {
    return this.saasService.createBillingPortalSession(user.id);
  }

  @Post("webhook")
  async webhook(
    @Headers("stripe-signature") signature: string,
    @Req() req: RawBodyRequest<Request> & { rawBody?: Buffer },
  ) {
    return this.saasService.handleStripeWebhook(signature, req.rawBody || Buffer.from(""));
  }

  @Get("admin/exempt-users")
  @UseGuards(JwtGuard, AdministratorGuard)
  async getExemptUsers(@Query("search") search?: string) {
    return this.saasService.searchUsersForExemption(search);
  }

  @Post("admin/exempt-users/:userId")
  @UseGuards(JwtGuard, AdministratorGuard)
  async addExemptUser(@Param("userId") userId: string) {
    await this.saasService.toggleBillingExempt(userId, true);
    return { success: true };
  }

  @Delete("admin/exempt-users/:userId")
  @UseGuards(JwtGuard, AdministratorGuard)
  async removeExemptUser(@Param("userId") userId: string) {
    await this.saasService.toggleBillingExempt(userId, false);
    return { success: true };
  }

  @Get("admin/payments")
  @UseGuards(JwtGuard, AdministratorGuard)
  async getPayments() {
    return this.saasService.getPaymentHistorySummary();
  }
}
