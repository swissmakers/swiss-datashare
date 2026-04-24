import { Injectable, Logger } from "@nestjs/common";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "@/constants";

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaLibSql({
      url: DATABASE_URL,
    });

    super({
      adapter,
    });
    super.$connect().then(() => this.logger.log("Connected to the database"));
  }
}
