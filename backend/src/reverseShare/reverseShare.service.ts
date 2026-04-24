import { BadRequestException, Injectable } from "@nestjs/common";
import moment from "moment";
import { ConfigService } from "@/config/config.service";
import { FileService } from "@/file/file.service";
import { PrismaService } from "@/prisma/prisma.service";
import { SaasService } from "@/saas/saas.service";
import { parseRelativeDateToAbsolute } from "@/utils/date.util";
import { CreateReverseShareDTO } from "./dto/createReverseShare.dto";

@Injectable()
export class ReverseShareService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private fileService: FileService,
    private saasService: SaasService,
  ) {}

  async create(data: CreateReverseShareDTO, creatorId: string) {
    // Parse date string to date
    const expirationDate = moment()
      .add(
        data.shareExpiration.split("-")[0],
        data.shareExpiration.split(
          "-",
        )[1] as moment.unitOfTime.DurationConstructor,
      )
      .toDate();

    const parsedExpiration = parseRelativeDateToAbsolute(data.shareExpiration);
    const maxExpiration = this.config.get("share.maxExpiration");
    if (
      maxExpiration.value !== 0 &&
      parsedExpiration >
        moment().add(maxExpiration.value, maxExpiration.unit).toDate()
    ) {
      throw new BadRequestException(
        "Expiration date exceeds maximum expiration date",
      );
    }

    const globalMaxShareSize = this.config.get("share.maxSize");

    if (globalMaxShareSize < data.maxShareSize)
      throw new BadRequestException(
        `Max share size can't be greater than ${globalMaxShareSize} bytes.`,
      );

    const reverseShareData = {
      name: data.name?.trim() || null,
      shareExpiration: expirationDate,
      remainingUses: data.maxUseCount,
      maxShareSize: data.maxShareSize,
      sendEmailNotification: data.sendEmailNotification,
      simplified: data.simplified,
      publicAccess: data.publicAccess,
      creatorId,
    } as any;

    const reverseShare = await this.prisma.reverseShare.create({
      data: reverseShareData,
    });

    return reverseShare.token;
  }

  async getByToken(reverseShareToken?: string) {
    if (!reverseShareToken) return null;

    const reverseShare = await this.prisma.reverseShare.findUnique({
      where: { token: reverseShareToken },
      include: { creator: { select: { locale: true } } },
    });

    return reverseShare;
  }

  async getAllByUser(userId: string) {
    const reverseShares = await this.prisma.reverseShare.findMany({
      where: {
        creatorId: userId,
        shareExpiration: { gt: new Date() },
      },
      orderBy: {
        shareExpiration: "desc",
      },
      include: { shares: { include: { creator: true } } },
    });

    return reverseShares;
  }

  async isValid(reverseShareToken: string) {
    const reverseShare = await this.prisma.reverseShare.findUnique({
      where: { token: reverseShareToken },
    });

    if (!reverseShare) return false;

    const isExpired = new Date() > reverseShare.shareExpiration;
    const remainingUsesExceeded = reverseShare.remainingUses <= 0;
    const creatorCompliant = await this.saasService.isUserBillingCompliant(
      reverseShare.creatorId,
    );

    return !(isExpired || remainingUsesExceeded || !creatorCompliant);
  }

  async remove(id: string) {
    const shares = await this.prisma.share.findMany({
      where: { reverseShare: { id } },
    });

    for (const share of shares) {
      await this.prisma.share.delete({ where: { id: share.id } });
      await this.fileService.deleteAllFiles(share.id);
    }

    await this.prisma.reverseShare.delete({ where: { id } });
  }
}
