import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "src/config/config.service";
import { PrismaService } from "src/prisma/prisma.service";
import { getEmailCopy } from "./i18n/messages";
import { normalizeEmailLocale } from "./i18n/locales";
import { EmailBranding, renderEmailTemplate } from "./template/email-template.renderer";

type ShareNotificationCreator = {
  username?: string | null;
  email?: string | null;
  locale?: string | null;
};

type PrismaUserDelegate = {
  findUnique(args: {
    where: { email: string };
  }): Promise<{ locale: string | null } | null>;
};

@Injectable()
export class EmailService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(EmailService.name);

  getTransporter() {
    if (!this.config.get("smtp.enabled"))
      throw new InternalServerErrorException("SMTP is disabled");

    const username = this.config.get("smtp.username");
    const password = this.config.get("smtp.password");

    return nodemailer.createTransport({
      host: this.config.get("smtp.host"),
      port: this.config.get("smtp.port"),
      secure: this.config.get("smtp.port") == 465,
      auth:
        username || password ? { user: username, pass: password } : undefined,
      tls: {
        rejectUnauthorized: !this.config.get(
          "smtp.allowUnauthorizedCertificates",
        ),
      },
    });
  }

  private interpolate(
    template: string,
    values: Record<string, string | number>,
  ): string {
    return template.replace(/\{([a-zA-Z0-9]+)\}/g, (_, key: string) => {
      const value = values[key];
      return value === undefined || value === null ? "" : String(value);
    });
  }

  private parseLocalizedConfigMap(rawValue: string): Record<string, string> | null {
    try {
      const parsed = JSON.parse(rawValue);
      if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed))
        return null;

      const normalizedMap = Object.entries(parsed).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (typeof value === "string") acc[key] = value;
          return acc;
        },
        {},
      );

      return Object.keys(normalizedMap).length ? normalizedMap : null;
    } catch {
      return null;
    }
  }

  private getLocalizedConfigOverride(
    configName:
      | "shareRecipientsSubject"
      | "shareRecipientsMessage"
      | "reverseShareSubject"
      | "reverseShareMessage"
      | "resetPasswordSubject"
      | "resetPasswordMessage"
      | "inviteSubject"
      | "inviteMessage",
    locale: string,
  ): string | undefined {
    const rawValue = this.config.get(`email.${configName}`);
    if (typeof rawValue !== "string" || !rawValue.trim()) return undefined;

    const normalizedLocale = normalizeEmailLocale(locale);
    const configMap = this.parseLocalizedConfigMap(rawValue);

    if (!configMap) {
      // Backward compatibility: legacy plain-text config values are treated as
      // English overrides only.
      return normalizedLocale === "en-US" ? rawValue : undefined;
    }

    const baseLanguage = normalizedLocale.split("-")[0];
    return (
      configMap[normalizedLocale] ??
      configMap[baseLanguage] ??
      configMap["en-US"] ??
      configMap["en"] ??
      undefined
    );
  }

  private resolveMessageLines(
    configuredMessage: string | undefined,
    fallbackLines: string[],
    interpolationValues: Record<string, string | number>,
  ): string[] {
    if (!configuredMessage?.trim()) return fallbackLines;
    return this.interpolate(
      configuredMessage.replaceAll("\\n", "\n"),
      interpolationValues,
    )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private getAppUrl(): string {
    const appUrl = this.config.get("general.appUrl")?.toString()?.trim();
    if (!appUrl) return "http://localhost:3000";
    return appUrl.replace(/\/+$/, "");
  }

  private resolveLogoScalePercent(): number {
    const raw = this.config.get("general.logoScalePercent");
    const n =
      typeof raw === "number" && Number.isFinite(raw)
        ? raw
        : parseInt(String(raw ?? "100"), 10);
    if (!Number.isFinite(n)) return 100;
    return Math.min(250, Math.max(25, n));
  }

  private buildBranding(footerPrefix: string): EmailBranding {
    const appName = this.config.get("general.appName")?.toString().trim();
    const appUrl = this.getAppUrl();
    const footerBrandText = this.config
      .get("general.poweredByText")
      ?.toString()
      .trim();
    const footerBrandUrl = this.config
      .get("general.poweredByUrl")
      ?.toString()
      .trim();

    const scale = this.resolveLogoScalePercent() / 100;
    const logoMaxWidthPx = Math.round(520 * scale);
    const logoMaxHeightPx = Math.round(48 * scale);

    return {
      appName: appName || "Swiss DataShare",
      appUrl,
      logoUrl: `${appUrl}/img/logo.png`,
      footerBrandText: `${footerPrefix} ${footerBrandText || "Swissmakers GmbH"}`,
      footerBrandUrl:
        footerBrandUrl || "https://github.com/swissmakers/swiss-datashare",
      logoMaxWidthPx,
      logoMaxHeightPx,
    };
  }

  private prismaUser(): PrismaUserDelegate {
    return (this.prisma as unknown as { user: PrismaUserDelegate }).user;
  }

  private async resolveLocale(recipientEmail: string, senderLocale?: string) {
    const recipient = (await this.prismaUser()
      .findUnique({
        where: { email: recipientEmail },
      })
      .catch(() => null)) as { locale?: string } | null;

    return normalizeEmailLocale(recipient?.locale ?? senderLocale);
  }

  private formatExpiration(locale: string, expiration?: Date): string {
    const copy = getEmailCopy(locale);
    if (!expiration || expiration.getTime() === 0) return copy.common.neverExpires;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(expiration);
  }

  private async sendMail(
    email: string,
    subject: string,
    text: string,
    html: string,
  ) {
    await this.getTransporter()
      .sendMail({
        from: `"${this.config.get("general.appName")}" <${this.config.get(
          "smtp.email",
        )}>`,
        to: email,
        subject,
        text,
        html,
      })
      .catch((e) => {
        this.logger.error(e);
        throw new InternalServerErrorException("Failed to send email");
      });
  }

  async sendMailToShareRecipients(
    recipientEmail: string,
    shareId: string,
    creator?: ShareNotificationCreator,
    description?: string,
    expiration?: Date,
  ) {
    if (!this.config.get("email.enableShareEmailRecipients"))
      throw new InternalServerErrorException("Email service disabled");

    // Share notification emails should follow the sender's language preference.
    // This keeps recipient emails consistent with the creator's account language.
    const locale = creator?.locale
      ? normalizeEmailLocale(creator.locale)
      : await this.resolveLocale(recipientEmail);
    const copy = getEmailCopy(locale);
    const branding = this.buildBranding(copy.common.footerPrefix);
    const shareUrl = `${branding.appUrl}/s/${shareId}`;

    const creatorName = creator?.username ?? copy.common.someone;
    const creatorEmail = creator?.email ?? copy.common.noEmail;
    const shareDescription = description?.trim() || copy.common.noDescription;
    const expiresAt = this.formatExpiration(locale, expiration);

    const subject = this.interpolate(copy.shareRecipients.subject, {
      appName: branding.appName,
    });
    const preheader = this.interpolate(copy.shareRecipients.preheader, {
      appName: branding.appName,
    });

    const intro = this.interpolate(copy.shareRecipients.intro, {
      creator: creatorName,
      creatorEmail,
    });
    const availability = this.interpolate(copy.shareRecipients.availabilityLine, {
      expires: expiresAt,
    });
    const message = this.interpolate(copy.shareRecipients.messageLine, {
      description: shareDescription,
    });
    const configuredSubject = this.getLocalizedConfigOverride(
      "shareRecipientsSubject",
      locale,
    );
    const configuredMessage = this.getLocalizedConfigOverride(
      "shareRecipientsMessage",
      locale,
    );
    const introLines = this.resolveMessageLines(
      configuredMessage,
      [intro, availability, message],
      {
        creator: creatorName,
        creatorEmail,
        shareUrl,
        desc: shareDescription,
        description: shareDescription,
        expires: expiresAt,
      },
    );

    const rendered = renderEmailTemplate({
      preheader,
      title: copy.shareRecipients.title,
      introLines,
      actionLabel: copy.shareRecipients.actionLabel,
      actionUrl: shareUrl,
      securityNotice: this.interpolate(copy.common.securityNotice, {
        appName: branding.appName,
      }),
      branding,
    });

    await this.sendMail(
      recipientEmail,
      configuredSubject
        ? this.interpolate(configuredSubject, { appName: branding.appName })
        : subject,
      rendered.text,
      rendered.html,
    );
  }

  async sendMailToReverseShareCreator(
    recipientEmail: string,
    shareId: string,
    note?: string,
    senderLocale?: string,
  ) {
    const locale = await this.resolveLocale(recipientEmail, senderLocale);
    const copy = getEmailCopy(locale);
    const branding = this.buildBranding(copy.common.footerPrefix);
    const shareUrl = `${branding.appUrl}/s/${shareId}`;
    const senderNote = note?.trim() || copy.common.noNote;

    const subject = this.interpolate(copy.reverseShare.subject, {
      appName: branding.appName,
    });
    const preheader = this.interpolate(copy.reverseShare.preheader, {
      appName: branding.appName,
    });
    const message = this.interpolate(copy.reverseShare.messageLine, {
      note: senderNote,
    });
    const configuredSubject = this.getLocalizedConfigOverride(
      "reverseShareSubject",
      locale,
    );
    const configuredMessage = this.getLocalizedConfigOverride(
      "reverseShareMessage",
      locale,
    );
    const introLines = this.resolveMessageLines(
      configuredMessage,
      [copy.reverseShare.intro, message],
      {
        shareUrl,
        note: senderNote,
      },
    );

    const rendered = renderEmailTemplate({
      preheader,
      title: copy.reverseShare.title,
      introLines,
      actionLabel: copy.reverseShare.actionLabel,
      actionUrl: shareUrl,
      securityNotice: this.interpolate(copy.common.securityNotice, {
        appName: branding.appName,
      }),
      branding,
    });

    await this.sendMail(
      recipientEmail,
      configuredSubject
        ? this.interpolate(configuredSubject, { appName: branding.appName })
        : subject,
      rendered.text,
      rendered.html,
    );
  }

  async sendResetPasswordEmail(recipientEmail: string, token: string) {
    const locale = await this.resolveLocale(recipientEmail);
    const copy = getEmailCopy(locale);
    const branding = this.buildBranding(copy.common.footerPrefix);
    const resetPasswordUrl = `${branding.appUrl}/auth/resetPassword/${token}`;
    const subject = this.interpolate(copy.resetPassword.subject, {
      appName: branding.appName,
    });
    const preheader = this.interpolate(copy.resetPassword.preheader, {
      appName: branding.appName,
    });
    const intro = this.interpolate(copy.resetPassword.intro, {
      appName: branding.appName,
    });
    const configuredSubject = this.getLocalizedConfigOverride(
      "resetPasswordSubject",
      locale,
    );
    const configuredMessage = this.getLocalizedConfigOverride(
      "resetPasswordMessage",
      locale,
    );
    const introLines = this.resolveMessageLines(configuredMessage, [intro], {
      url: resetPasswordUrl,
    });

    const rendered = renderEmailTemplate({
      preheader,
      title: copy.resetPassword.title,
      introLines,
      actionLabel: copy.resetPassword.actionLabel,
      actionUrl: resetPasswordUrl,
      securityNotice: this.interpolate(copy.common.securityNotice, {
        appName: branding.appName,
      }),
      branding,
    });

    await this.sendMail(
      recipientEmail,
      configuredSubject
        ? this.interpolate(configuredSubject, { appName: branding.appName })
        : subject,
      rendered.text,
      rendered.html,
    );
  }

  async sendInviteEmail(
    recipientEmail: string,
    password: string,
    senderLocale?: string,
  ) {
    const locale = await this.resolveLocale(recipientEmail, senderLocale);
    const copy = getEmailCopy(locale);
    const branding = this.buildBranding(copy.common.footerPrefix);
    const loginUrl = `${branding.appUrl}/auth/signIn`;

    const subject = this.interpolate(copy.invite.subject, {
      appName: branding.appName,
    });
    const preheader = this.interpolate(copy.invite.preheader, {
      appName: branding.appName,
    });
    const intro = this.interpolate(copy.invite.intro, {
      appName: branding.appName,
    });
    const credentials = this.interpolate(copy.invite.credentialsLine, {
      email: recipientEmail,
      password,
    });
    const configuredSubject = this.getLocalizedConfigOverride(
      "inviteSubject",
      locale,
    );
    const configuredMessage = this.getLocalizedConfigOverride(
      "inviteMessage",
      locale,
    );
    const introLines = this.resolveMessageLines(
      configuredMessage,
      [intro, credentials],
      {
        url: loginUrl,
        email: recipientEmail,
        password,
      },
    );

    const rendered = renderEmailTemplate({
      preheader,
      title: copy.invite.title,
      introLines,
      actionLabel: copy.invite.actionLabel,
      actionUrl: loginUrl,
      securityNotice: this.interpolate(copy.common.securityNotice, {
        appName: branding.appName,
      }),
      branding,
    });

    await this.sendMail(
      recipientEmail,
      configuredSubject
        ? this.interpolate(configuredSubject, { appName: branding.appName })
        : subject,
      rendered.text,
      rendered.html,
    );
  }

  async sendTestMail(recipientEmail: string, senderLocale?: string) {
    const locale = await this.resolveLocale(recipientEmail, senderLocale);
    const copy = getEmailCopy(locale);
    const branding = this.buildBranding(copy.common.footerPrefix);

    const subject = this.interpolate(copy.testMail.subject, {
      appName: branding.appName,
    });
    const preheader = this.interpolate(copy.testMail.preheader, {
      appName: branding.appName,
    });
    const intro = this.interpolate(copy.testMail.intro, {
      appName: branding.appName,
    });

    const rendered = renderEmailTemplate({
      preheader,
      title: copy.testMail.title,
      introLines: [intro],
      actionLabel: copy.testMail.actionLabel,
      actionUrl: branding.appUrl,
      securityNotice: this.interpolate(copy.common.securityNotice, {
        appName: branding.appName,
      }),
      branding,
    });

    await this.sendMail(recipientEmail, subject, rendered.text, rendered.html);
  }
}
