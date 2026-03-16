import { Injectable, Logger } from "@nestjs/common";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "../constants";

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });

    super({
      adapter,
    });
    super.$connect().then(() => this.logger.log("Connected to the database"));
  }
}
