import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { User } from "@prisma/client";
import { GetUser } from "@/auth/decorator/getUser.decorator";
import { JwtGuard } from "@/auth/guard/jwt.guard";
import { ContactService } from "./contact.service";
import { ContactDTO } from "./dto/contact.dto";
import { CreateContactDTO } from "./dto/createContact.dto";
import { UpdateContactDTO } from "./dto/updateContact.dto";

@Controller("contacts")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Throttle({ default: { limit: 60, ttl: 60 } })
  @Get()
  @UseGuards(JwtGuard)
  async list(
    @GetUser() user: User,
    @Query("q") q?: string,
    @Query("limit") limit?: string,
  ) {
    const parsed =
      limit !== undefined && limit !== ""
        ? Number.parseInt(limit, 10)
        : 20;
    const rows = await this.contactService.listForUser(
      user.id,
      q,
      Number.isFinite(parsed) ? parsed : 20,
    );
    return new ContactDTO().fromList(rows);
  }

  @Post()
  @UseGuards(JwtGuard)
  async create(@GetUser() user: User, @Body() body: CreateContactDTO) {
    return new ContactDTO().from(
      await this.contactService.create(user.id, body),
    );
  }

  @Patch(":id")
  @UseGuards(JwtGuard)
  async update(
    @GetUser() user: User,
    @Param("id") id: string,
    @Body() body: UpdateContactDTO,
  ) {
    return new ContactDTO().from(
      await this.contactService.update(user.id, id, body),
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @UseGuards(JwtGuard)
  async remove(@GetUser() user: User, @Param("id") id: string) {
    await this.contactService.remove(user.id, id);
  }
}
