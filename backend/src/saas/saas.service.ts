import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { ConfigService } from "@/config/config.service";
import { PrismaService } from "@/prisma/prisma.service";
import * as StripeModule from "stripe";

@Injectable()
export class SaasService {
  private readonly logger = new Logger(SaasService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private getStripeClient(): any {
    const secretKey = this.config.get("saas.stripeSecretKey") as string;
    if (!secretKey) {
      throw new BadRequestException("Stripe secret key is not configured");
    }
    const StripeCtor =
      (StripeModule as any).Stripe ||
      (StripeModule as any).default ||
      StripeModule;
    return new StripeCtor(secretKey);
  }

  private hasSaasUseCase(): boolean {
    const useCase = (this.config.get("general.useCase") || "default")
      .toString()
      .toLowerCase();
    return useCase
      .split(",")
      .map((item) => item.trim())
      .includes("saas");
  }

  isBillingEnforced(): boolean {
    return (
      this.hasSaasUseCase() &&
      this.config.get("saas.enabled") === true &&
      this.config.get("saas.enforceSubscription") === true
    );
  }

  private async getBillingUser(userId: string): Promise<any | null> {
    const rows = (await this.prisma.$queryRawUnsafe(
      `SELECT id, createdAt, username, email, isAdmin, billingExempt, billingTrialStartAt, stripeCustomerId, stripeSubscriptionId, stripeSubscriptionStatus, stripeCurrentPeriodEnd, stripeLastPaymentAt
       FROM "User" WHERE id = ? LIMIT 1`,
      userId,
    )) as any[];
    return rows[0] || null;
  }

  private getTrialEndDate(user: User): Date {
    const trialDays = this.config.get("saas.trialDays") as number;
    const billingTrialStartAt = (user as any).billingTrialStartAt as Date | null;
    const trialStart =
      billingTrialStartAt && billingTrialStartAt.getUTCFullYear() > 2000
        ? billingTrialStartAt
        : user.createdAt;
    return new Date(trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000);
  }

  private getGraceEndDate(user: User): Date | null {
    if (!(user as any).stripeCurrentPeriodEnd) return null;
    const graceDays = this.config.get("saas.graceDays") as number;
    return new Date(
      (user as any).stripeCurrentPeriodEnd.getTime() +
        graceDays * 24 * 60 * 60 * 1000,
    );
  }

  private isSubscriptionStatusCompliant(status?: string | null): boolean {
    return !!status && ["active", "trialing"].includes(status);
  }

  private async getStripeSubscriptionSnapshot(user: any): Promise<{
    status: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    cancelAt: Date | null;
  } | null> {
    if (!(user as any)?.stripeSubscriptionId) return null;
    if (!(this.config.get("saas.stripeSecretKey") as string)) return null;

    try {
      const stripe = this.getStripeClient();
      const subscription = (await stripe.subscriptions.retrieve(
        (user as any).stripeSubscriptionId,
      )) as any;

      if (!subscription) return null;

      return {
        status: subscription.status || null,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Stripe subscription snapshot for user ${user.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async isUserBillingCompliant(userId: string): Promise<boolean> {
    if (!this.isBillingEnforced()) return true;

    const user = await this.getBillingUser(userId);
    if (!user) return false;

    if (user.isAdmin || (user as any).billingExempt) return true;

    const now = new Date();
    const trialEnd = this.getTrialEndDate(user);
    if (now <= trialEnd) return true;

    if (this.isSubscriptionStatusCompliant((user as any).stripeSubscriptionStatus))
      return true;

    const graceEnd = this.getGraceEndDate(user);
    if (graceEnd && now <= graceEnd) return true;

    return false;
  }

  async assertUserCanShare(userId: string): Promise<void> {
    const compliant = await this.isUserBillingCompliant(userId);
    if (!compliant) {
      throw new ForbiddenException(
        "Subscription overdue. Please update billing to continue sharing.",
        "subscription_overdue",
      );
    }
  }

  async getBillingStatus(userId: string, options?: { syncStripe?: boolean }) {
    const user = await this.getBillingUser(userId);
    if (!user) throw new BadRequestException("User not found");

    const compliant = await this.isUserBillingCompliant(userId);
    const trialEndsAt = this.getTrialEndDate(user);
    const graceEndsAt = this.getGraceEndDate(user);
    const exempt = user.isAdmin || (user as any).billingExempt;
    const monthlyPriceId = this.config.get("saas.stripeMonthlyPriceId") as string;
    const yearlyPriceId = this.config.get("saas.stripeYearlyPriceId") as string;
    const canManagePortal = !!(user as any).stripeCustomerId;
    let subscriptionStatus = ((user as any).stripeSubscriptionStatus ||
      "none") as string;
    let subscriptionCurrentPeriodEnd =
      ((user as any).stripeCurrentPeriodEnd as Date | null) || null;
    let cancelAtPeriodEnd = false;
    let cancelAt: Date | null = null;

    if (options?.syncStripe !== false) {
      const stripeSnapshot = await this.getStripeSubscriptionSnapshot(user);
      if (stripeSnapshot) {
        subscriptionStatus = stripeSnapshot.status || "none";
        subscriptionCurrentPeriodEnd = stripeSnapshot.currentPeriodEnd;
        cancelAtPeriodEnd = stripeSnapshot.cancelAtPeriodEnd;
        cancelAt = stripeSnapshot.cancelAt;

        await this.prisma.$executeRawUnsafe(
          `UPDATE "User"
           SET stripeSubscriptionStatus = ?, stripeCurrentPeriodEnd = ?
           WHERE id = ?`,
          subscriptionStatus,
          subscriptionCurrentPeriodEnd,
          user.id,
        );
      }
    }

    const hasOngoingSubscription = [
      "active",
      "trialing",
      "past_due",
      "unpaid",
      "incomplete",
    ].includes(subscriptionStatus);

    return {
      enforced: this.isBillingEnforced(),
      exempt,
      compliant,
      status: subscriptionStatus,
      trialEndsAt,
      graceEndsAt,
      subscriptionCurrentPeriodEnd,
      canCheckoutMonthly: !exempt && !hasOngoingSubscription && !!monthlyPriceId,
      canCheckoutYearly: !exempt && !hasOngoingSubscription && !!yearlyPriceId,
      canManagePortal: !exempt && canManagePortal,
      hasOngoingSubscription,
      cancelAtPeriodEnd,
      cancelAt,
      publishableKey: this.config.get("saas.stripePublishableKey") as string,
      monthlyPriceChf: this.config.get("saas.monthlyPriceChf") as string,
      yearlyPriceChf: this.config.get("saas.yearlyPriceChf") as string,
    };
  }

  private async ensureStripeCustomer(user: any): Promise<string> {
    if ((user as any).stripeCustomerId) return (user as any).stripeCustomerId;

    const stripe = this.getStripeClient();
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: { userId: user.id },
    });

    await this.prisma.$executeRawUnsafe(
      `UPDATE "User" SET stripeCustomerId = ? WHERE id = ?`,
      customer.id,
      user.id,
    );

    return customer.id;
  }

  async createCheckoutSession(userId: string, interval: "monthly" | "yearly") {
    const user = await this.getBillingUser(userId);
    if (!user) throw new BadRequestException("User not found");

    const priceId =
      interval === "monthly"
        ? (this.config.get("saas.stripeMonthlyPriceId") as string)
        : (this.config.get("saas.stripeYearlyPriceId") as string);

    if (!priceId) {
      throw new BadRequestException("Stripe price ID is not configured");
    }

    const stripe = this.getStripeClient();
    const customerId = await this.ensureStripeCustomer(user);
    const appUrl = this.config.get("general.appUrl") as string;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/account?billing=success`,
      cancel_url: `${appUrl}/account?billing=cancel`,
      metadata: { userId: user.id },
    });

    return { url: session.url };
  }

  async createBillingPortalSession(userId: string) {
    const user = await this.getBillingUser(userId);
    if (!(user as any)?.stripeCustomerId) {
      throw new BadRequestException("No Stripe customer exists for this user");
    }

    const stripe = this.getStripeClient();
    const appUrl = this.config.get("general.appUrl") as string;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: (user as any).stripeCustomerId,
      return_url: `${appUrl}/account`,
    });

    return { url: portalSession.url };
  }

  async toggleBillingExempt(userId: string, exempt: boolean) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE "User" SET billingExempt = ? WHERE id = ?`,
      exempt ? 1 : 0,
      userId,
    );
  }

  async searchUsersForExemption(query?: string) {
    const search = query?.trim();
    const where = search
      ? `WHERE username LIKE '%${search.replace(/'/g, "''")}%' OR email LIKE '%${search.replace(/'/g, "''")}%'`
      : "";
    return this.prisma.$queryRawUnsafe(
      `SELECT id, username, email, isAdmin, billingExempt FROM "User" ${where} ORDER BY createdAt DESC LIMIT 50`,
    ) as Promise<
      Array<{
        id: string;
        username: string;
        email: string;
        isAdmin: boolean;
        billingExempt: boolean;
      }>
    >;
  }

  async getPaymentHistorySummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [history, allAgg, monthAgg, yearAgg] = await Promise.all([
      (this.prisma as any).saasPayment.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, username: true, email: true } } },
      }),
      (this.prisma as any).saasPayment.aggregate({ _sum: { amountChfCents: true } }),
      (this.prisma as any).saasPayment.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { amountChfCents: true },
      }),
      (this.prisma as any).saasPayment.aggregate({
        where: { createdAt: { gte: yearStart } },
        _sum: { amountChfCents: true },
      }),
    ]);

    return {
      history,
      totals: {
        monthChfCents: monthAgg._sum.amountChfCents || 0,
        yearChfCents: yearAgg._sum.amountChfCents || 0,
        allTimeChfCents: allAgg._sum.amountChfCents || 0,
      },
    };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get("saas.stripeWebhookSecret") as string;
    if (!webhookSecret) {
      throw new BadRequestException("Stripe webhook secret is not configured");
    }

    const stripe = this.getStripeClient();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    const alreadyProcessed = await (this.prisma as any).saasWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (alreadyProcessed) return { received: true, duplicate: true };

    let relatedUserId: string | null = null;

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;
      const rows = (await this.prisma.$queryRawUnsafe(
        `SELECT id FROM "User" WHERE stripeCustomerId = ? LIMIT 1`,
        customerId,
      )) as Array<{ id: string }>;
      const user = rows[0];
      if (user) {
        relatedUserId = user.id;
        await this.prisma.$executeRawUnsafe(
          `UPDATE "User"
           SET stripeSubscriptionId = ?, stripeSubscriptionStatus = ?, stripeCurrentPeriodEnd = ?
           WHERE id = ?`,
          subscription.id,
          subscription.status || null,
          subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
          user.id,
        );
      }
    }

    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as any;
      const customerId = invoice.customer as string;
      const rows = (await this.prisma.$queryRawUnsafe(
        `SELECT id FROM "User" WHERE stripeCustomerId = ? LIMIT 1`,
        customerId,
      )) as Array<{ id: string }>;
      const user = rows[0];
      if (user) {
        relatedUserId = user.id;
        if (event.type === "invoice.paid") {
          await this.prisma.$executeRawUnsafe(
            `UPDATE "User" SET stripeLastPaymentAt = ?, stripeSubscriptionStatus = ? WHERE id = ?`,
            new Date(),
            "active",
            user.id,
          );
        }

        await (this.prisma as any).saasPayment.upsert({
          where: { stripeInvoiceId: invoice.id },
          create: {
            userId: user.id,
            stripeInvoiceId: invoice.id,
            stripePaymentIntentId:
              typeof invoice.payment_intent === "string"
                ? invoice.payment_intent
                : null,
            amountChfCents: invoice.amount_paid || 0,
            currency: invoice.currency || "chf",
            status: invoice.status || "unknown",
            periodStart: invoice.period_start
              ? new Date(invoice.period_start * 1000)
              : null,
            periodEnd: invoice.period_end
              ? new Date(invoice.period_end * 1000)
              : null,
          },
          update: {
            amountChfCents: invoice.amount_paid || 0,
            currency: invoice.currency || "chf",
            status: invoice.status || "unknown",
            periodStart: invoice.period_start
              ? new Date(invoice.period_start * 1000)
              : null,
            periodEnd: invoice.period_end
              ? new Date(invoice.period_end * 1000)
              : null,
          },
        });
      }
    }

    await (this.prisma as any).saasWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        userId: relatedUserId,
      },
    });

    this.logger.log(`Processed Stripe event ${event.id} (${event.type})`);
    return { received: true };
  }
}
