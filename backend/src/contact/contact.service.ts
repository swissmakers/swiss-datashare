import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateContactDTO } from "./dto/createContact.dto";
import { UpdateContactDTO } from "./dto/updateContact.dto";
import type { ContactEntity } from "./dto/contact.dto";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/** Prisma client gains this delegate after `prisma generate` (UserContact model). */
type PrismaWithContacts = PrismaService & {
  userContact: {
    findMany: (args: unknown) => Promise<ContactEntity[]>;
    findFirst: (args: unknown) => Promise<ContactEntity | null>;
    create: (args: unknown) => Promise<ContactEntity>;
    update: (args: unknown) => Promise<ContactEntity>;
    delete: (args: unknown) => Promise<ContactEntity>;
  };
};

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  private db(): PrismaWithContacts["userContact"] {
    return (this.prisma as PrismaWithContacts).userContact;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  async listForUser(
    userId: string,
    q?: string,
    limit = 20,
  ) {
    const take = Math.min(Math.max(limit, 1), 50);
    const trimmed = q?.trim() ?? "";

    if (!trimmed) {
      return this.db().findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take,
      });
    }

    const rows = await this.db().findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });

    const needle = trimmed.toLowerCase();
    return rows
      .filter(
        (r) =>
          r.name.toLowerCase().includes(needle) ||
          r.email.toLowerCase().includes(needle) ||
          r.kind.toLowerCase().includes(needle) ||
          (r.notes?.toLowerCase().includes(needle) ?? false),
      )
      .slice(0, take);
  }

  async create(userId: string, dto: CreateContactDTO) {
    if (!EMAIL_REGEX.test(dto.email)) {
      throw new ConflictException("Invalid email");
    }
    const email = this.normalizeEmail(dto.email);
    const name = this.normalizeName(dto.name);

    try {
      return await this.db().create({
        data: {
          userId,
          kind: dto.kind,
          name,
          email,
          notes: dto.notes?.trim() || null,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("A contact with this email already exists");
      }
      throw e;
    }
  }

  async update(userId: string, id: string, dto: UpdateContactDTO) {
    const existing = await this.db().findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException("Contact not found");

    const email =
      dto.email !== undefined ? this.normalizeEmail(dto.email) : undefined;
    if (email !== undefined && !EMAIL_REGEX.test(email)) {
      throw new ConflictException("Invalid email");
    }

    try {
      return await this.db().update({
        where: { id },
        data: {
          ...(dto.kind !== undefined ? { kind: dto.kind } : {}),
          ...(dto.name !== undefined ? { name: this.normalizeName(dto.name) } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(dto.notes !== undefined
            ? { notes: dto.notes === null ? null : dto.notes.trim() || null }
            : {}),
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("A contact with this email already exists");
      }
      throw e;
    }
  }

  async remove(userId: string, id: string) {
    const existing = await this.db().findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException("Contact not found");

    await this.db().delete({ where: { id } });
  }
}
