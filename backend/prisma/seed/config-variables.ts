import * as crypto from "crypto";

/** Fields we persist on `Config` rows (name, category, order are set at insert time). */
type ConfigSeedFields = {
  type: string;
  defaultValue?: string;
  value?: string;
  secret?: boolean;
  obscured?: boolean;
  locked?: boolean;
};

type ConfigVariables = {
  [category: string]: {
    [variable: string]: ConfigSeedFields;
  };
};

export const configVariables = {
  internal: {
    jwtSecret: {
      type: "string",
      value: crypto.randomBytes(256).toString("base64"),
      locked: true,
    },
    /** 32-byte key (base64) for AES-256-GCM encryption of OAuth ID tokens at rest in RefreshToken.oauthIDToken */
    oauthTokenEncryptionKey: {
      type: "string",
      value: crypto.randomBytes(32).toString("base64"),
      locked: true,
    },
  },
  general: {
    appName: {
      type: "string",
      defaultValue: "Swiss DataShare",
      secret: false,
    },
    appUrl: {
      type: "string",
      defaultValue: "http://localhost:3000",
      secret: false,
    },
    poweredByText: {
      type: "string",
      defaultValue: "Swiss DataShare",
      secret: false,
    },
    poweredByUrl: {
      type: "string",
      defaultValue: "https://github.com/swissmakers/swiss-datashare",
      secret: false,
    },
    secureCookies: {
      type: "boolean",
      defaultValue: "false",
    },
    showHomePage: {
      type: "boolean",
      defaultValue: "true",
      secret: false,
    },
    sessionDuration: {
      type: "timespan",
      defaultValue: "3 months",
      secret: false,
    },
    location: {
      type: "string",
      defaultValue: "",
      secret: false,
    },
    useCase: {
      type: "string",
      defaultValue: "default",
      secret: false,
    },
    defaultLocale: {
      type: "string",
      defaultValue: "en-US",
      secret: false,
    },
    logoScalePercent: {
      type: "number",
      defaultValue: "100",
      secret: false,
    },
    headerShowAppName: {
      type: "boolean",
      defaultValue: "true",
      secret: false,
    },
  },
  share: {
    allowRegistration: {
      type: "boolean",
      defaultValue: "true",
      secret: false,
    },
    allowUnauthenticatedShares: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    maxExpiration: {
      type: "timespan",
      defaultValue: "0 days",
      secret: false,
    },
    shareIdLength: {
      type: "number",
      defaultValue: "8",
      secret: false,
    },
    maxSize: {
      type: "filesize",
      defaultValue: "1000000000",
      secret: false,
    },
    zipCompressionLevel: {
      type: "number",
      defaultValue: "9",
    },
    chunkSize: {
      type: "filesize",
      defaultValue: "10000000",
      secret: false,
    },
    autoOpenShareModal: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
  },
  saas: {
    enabled: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    monthlyPriceChf: {
      type: "string",
      defaultValue: "29.00",
      secret: false,
    },
    yearlyPriceChf: {
      type: "string",
      defaultValue: "290.00",
      secret: false,
    },
    trialDays: {
      type: "number",
      defaultValue: "60",
      secret: false,
    },
    graceDays: {
      type: "number",
      defaultValue: "3",
      secret: false,
    },
    enforceSubscription: {
      type: "boolean",
      defaultValue: "true",
      secret: false,
    },
    stripePublishableKey: {
      type: "string",
      defaultValue: "",
      secret: false,
    },
    stripeSecretKey: {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    stripeWebhookSecret: {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    stripeMonthlyPriceId: {
      type: "string",
      defaultValue: "",
    },
    stripeYearlyPriceId: {
      type: "string",
      defaultValue: "",
    },
  },
  cache: {
    "redis-enabled": {
      type: "boolean",
      defaultValue: "false",
    },
    "redis-url": {
      type: "string",
      defaultValue: "redis://swiss-datashare-redis:6379",
      secret: true,
    },
    ttl: {
      type: "number",
      defaultValue: "60",
    },
    maxItems: {
      type: "number",
      defaultValue: "1000",
    },
  },
  email: {
    enableShareEmailRecipients: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    shareRecipientsSubject: {
      type: "string",
      defaultValue: "Files shared with you",
    },
    shareRecipientsMessage: {
      type: "text",
      defaultValue:
        "Hey!\n\n{creator} ({creatorEmail}) shared some files with you. You can view or download the files with this link: {shareUrl}\n\nThe share will expire {expires}.\n\nNote: {desc}\n\nShared securely with Swiss DataShare",
    },
    reverseShareSubject: {
      type: "string",
      defaultValue: "Data request upload completed!",
    },
    reverseShareMessage: {
      type: "text",
      defaultValue:
        "Hey!\n\nSomeone finished an upload request and sent files to you: {shareUrl}\n\nMessage from sender: {note}\n\nShared securely with Swiss DataShare",
    },
    resetPasswordSubject: {
      type: "string",
      defaultValue: "Swiss DataShare password reset",
    },
    resetPasswordMessage: {
      type: "text",
      defaultValue:
        "Hey!\n\nYou requested a password reset. Click this link to reset your password: {url}\nThe link expires in an hour.\n\nSwiss DataShare",
    },
    inviteSubject: {
      type: "string",
      defaultValue: "Swiss DataShare invite",
    },
    inviteMessage: {
      type: "text",
      defaultValue:
        'Hey!\n\nYou were invited to Swiss DataShare. Click this link to accept the invite: {url}\n\nYou can use the email "{email}" and the password "{password}" to sign in.\n\nSwiss DataShare',
    },
  },
  smtp: {
    enabled: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    allowUnauthorizedCertificates: {
      type: "boolean",
      defaultValue: "false",

      secret: false,
    },
    host: {
      type: "string",
      defaultValue: "",
    },
    port: {
      type: "number",
      defaultValue: "0",
    },
    email: {
      type: "string",
      defaultValue: "",
    },
    username: {
      type: "string",
      defaultValue: "",
    },
    password: {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
  },
  ldap: {
    enabled: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    ignoreTlsVerification: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },

    url: {
      type: "string",
      defaultValue: "",
    },

    bindDn: {
      type: "string",
      defaultValue: "",
    },
    bindPassword: {
      type: "string",
      defaultValue: "",
      obscured: true,
    },

    searchBase: {
      type: "string",
      defaultValue: "",
    },
    searchQuery: {
      type: "string",
      defaultValue: "",
    },

    adminGroups: {
      type: "string",
      defaultValue: "",
    },

    fieldNameMemberOf: {
      type: "string",
      defaultValue: "memberOf",
    },
    fieldNameEmail: {
      type: "string",
      defaultValue: "userPrincipalName",
    },
  },
  oauth: {
    allowRegistration: {
      type: "boolean",
      defaultValue: "true",
    },
    ignoreTotp: {
      type: "boolean",
      defaultValue: "true",
    },
    disablePassword: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    "github-enabled": {
      type: "boolean",
      defaultValue: "false",
    },
    "github-clientId": {
      type: "string",
      defaultValue: "",
    },
    "github-clientSecret": {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    "google-enabled": {
      type: "boolean",
      defaultValue: "false",
    },
    "google-clientId": {
      type: "string",
      defaultValue: "",
    },
    "google-clientSecret": {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    "microsoft-enabled": {
      type: "boolean",
      defaultValue: "false",
    },
    "microsoft-tenant": {
      type: "string",
      defaultValue: "common",
    },
    "microsoft-clientId": {
      type: "string",
      defaultValue: "",
    },
    "microsoft-clientSecret": {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    "discord-enabled": {
      type: "boolean",
      defaultValue: "false",
    },
    "discord-limitedGuild": {
      type: "string",
      defaultValue: "",
    },
    "discord-limitedUsers": {
      type: "string",
      defaultValue: "",
    },
    "discord-clientId": {
      type: "string",
      defaultValue: "",
    },
    "discord-clientSecret": {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    "oidc-enabled": {
      type: "boolean",
      defaultValue: "false",
    },
    "oidc-discoveryUri": {
      type: "string",
      defaultValue: "",
    },
    "oidc-signOut": {
      type: "boolean",
      defaultValue: "false",
    },
    "oidc-scope": {
      type: "string",
      defaultValue: "openid email profile",
    },
    "oidc-usernameClaim": {
      type: "string",
      defaultValue: "",
    },
    "oidc-rolePath": {
      type: "string",
      defaultValue: "",
    },
    "oidc-roleGeneralAccess": {
      type: "string",
      defaultValue: "",
    },
    "oidc-roleAdminAccess": {
      type: "string",
      defaultValue: "",
    },
    "oidc-clientId": {
      type: "string",
      defaultValue: "",
    },
    "oidc-clientSecret": {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
  },
  s3: {
    enabled: {
      type: "boolean",
      defaultValue: "false",
    },
    endpoint: {
      type: "string",
      defaultValue: "",
    },
    region: {
      type: "string",
      defaultValue: "",
    },
    bucketName: {
      type: "string",
      defaultValue: "",
    },
    bucketPath: {
      type: "string",
      defaultValue: "",
    },
    key: {
      type: "string",
      defaultValue: "",
      secret: true,
    },
    secret: {
      type: "string",
      defaultValue: "",
      obscured: true,
    },
    useChecksum: {
      type: "boolean",
      defaultValue: "true",
    },
  },
  legal: {
    enabled: {
      type: "boolean",
      defaultValue: "false",
      secret: false,
    },
    imprintText: {
      type: "text",
      defaultValue: "",
      secret: false,
    },
    imprintUrl: {
      type: "string",
      defaultValue: "",
      secret: false,
    },
    privacyPolicyText: {
      type: "text",
      defaultValue: "",
      secret: false,
    },
    privacyPolicyUrl: {
      type: "string",
      defaultValue: "",
      secret: false,
    },
  },
} satisfies ConfigVariables;

export type YamlConfig = {
  [Category in keyof typeof configVariables]: {
    [Key in keyof (typeof configVariables)[Category]]: string;
  };
} & {
  initUser: {
    enabled: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    ldapDN: string;
  };
};
