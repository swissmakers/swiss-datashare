import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { Response } from "express";
import { GetUser } from "@/auth/decorator/getUser.decorator";
import { AdministratorGuard } from "@/auth/guard/isAdmin.guard";
import { JwtGuard } from "@/auth/guard/jwt.guard";
import { ConfigService } from "../config/config.service";
import { SaasService } from "../saas/saas.service";
import { CreateUserDTO } from "./dto/createUser.dto";
import { UpdateOwnUserDTO } from "./dto/updateOwnUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserDTO } from "./dto/user.dto";
import { UserSevice } from "./user.service";

@Controller("users")
export class UserController {
  constructor(
    private userService: UserSevice,
    private config: ConfigService,
    private saasService: SaasService,
  ) {}

  // Own user operations
  @Get("me")
  @UseGuards(JwtGuard)
  async getCurrentUser(@GetUser() user?: User) {
    if (!user) return null;
    const userDTO = new UserDTO().from(user);
    userDTO.hasPassword = !!user.password;
    return userDTO;
  }

  @Patch("me")
  @UseGuards(JwtGuard)
  async updateCurrentUser(
    @GetUser() user: User,
    @Body() data: UpdateOwnUserDTO,
  ) {
    return new UserDTO().from(await this.userService.update(user.id, data));
  }

  @Delete("me")
  @HttpCode(204)
  @UseGuards(JwtGuard)
  async deleteCurrentUser(
    @GetUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.userService.delete(user.id);

    const isSecure = this.config.get("general.secureCookies");

    response.cookie("access_token", "accessToken", {
      maxAge: -1,
      secure: isSecure,
    });
    response.cookie("refresh_token", "", {
      path: "/api/auth/token",
      httpOnly: true,
      maxAge: -1,
      secure: isSecure,
    });
  }

  // Global user operations
  @Get()
  @UseGuards(JwtGuard, AdministratorGuard)
  async list() {
    const users = await this.userService.list();
    const useCase = (this.config.get("general.useCase") || "default")
      .toString()
      .toLowerCase();
    const isSaasEnabled = useCase
      .split(",")
      .map((item) => item.trim())
      .includes("saas");

    if (!isSaasEnabled) {
      return new UserDTO().fromList(users);
    }

    const usersWithBilling = await Promise.all(
      users.map(async (user) => {
        const status = await this.saasService.getBillingStatus(user.id, {
          syncStripe: false,
        });
        return {
          ...user,
          billingExempt: status.exempt,
          billingCompliant: status.compliant,
          billingSubscriptionStatus: status.status,
        };
      }),
    );

    return new UserDTO().fromList(usersWithBilling);
  }

  @Post()
  @UseGuards(JwtGuard, AdministratorGuard)
  async create(@Body() user: CreateUserDTO, @GetUser() currentUser: User) {
    return new UserDTO().from(
      await this.userService.create(user, {
        locale: (currentUser as { locale?: string })?.locale,
      }),
    );
  }

  @Patch(":id")
  @UseGuards(JwtGuard, AdministratorGuard)
  async update(@Param("id") id: string, @Body() user: UpdateUserDto) {
    return new UserDTO().from(await this.userService.update(id, user));
  }

  @Delete(":id")
  @UseGuards(JwtGuard, AdministratorGuard)
  async delete(@Param("id") id: string) {
    return new UserDTO().from(await this.userService.delete(id));
  }
}
