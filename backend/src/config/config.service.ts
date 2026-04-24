import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import * as argon from "argon2";
import { EventEmitter } from "events";
import * as fs from "fs";
import { PrismaService } from "@/prisma/prisma.service";
import { stringToTimespan } from "@/utils/date.util";
import { parse as yamlParse } from "yaml";
import {
  buildDefaultEmailConfigTranslations,
  EmailConfigTranslationKey,
} from "@/email/i18n/messages";
import {
  buildDefaultLegalConfigTranslations,
  LegalConfigTranslationKey,
} from "@/legal/i18n/messages";
import {
  configVariables,
  YamlConfig,
} from "../../prisma/seed/config-variables";
import { CONFIG_FILE } from "@/constants";

type ConfigRow = {
  category: string;
  name: string;
  value: string | null;
  defaultValue: string;
  type: string;
  order: number;
  secret: boolean;
  locked: boolean;
  obscured: boolean;
};

type PrismaConfigDelegate = {
  findMany(): Promise<ConfigRow[]>;
  findUnique(args: unknown): Promise<ConfigRow | null>;
  create(args: unknown): Promise<ConfigRow>;
  updateMany(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<ConfigRow>;
};

type PrismaUserDelegate = {
  count(args: unknown): Promise<number>;
  create(args: unknown): Promise<unknown>;
};

/**
 * ConfigService extends EventEmitter to allow listening for config updates,
 * now only `update` event will be emitted.
 */
@Injectable()
export class ConfigService extends EventEmitter {
  yamlConfig?: YamlConfig;
  logger = new Logger(ConfigService.name);

  constructor(
    @Inject("CONFIG_VARIABLES") private configVariables: ConfigRow[],
    private prisma: PrismaService,
  ) {
    super();
  }

  private prismaConfig(): PrismaConfigDelegate {
    return (this.prisma as unknown as { config: PrismaConfigDelegate }).config;
  }

  private prismaUser(): PrismaUserDelegate {
    return (this.prisma as unknown as { user: PrismaUserDelegate }).user;
  }

  // Initialize gets called by the ConfigModule
  async initialize() {
    await this.ensureSchemaConfigRows();
    this.configVariables = await this.prismaConfig().findMany();
    await this.loadYamlConfig();

    if (this.yamlConfig) {
      await this.migrateInitUser();
    }
  }

  /**
   * Inserts any config keys from the schema that are missing in the DB (e.g. after upgrades)
   * and re-aligns `order` with the schema so admin UI ordering stays correct.
   */
  private async ensureSchemaConfigRows(): Promise<void> {
    for (const [category, configVariablesOfCategory] of Object.entries(
      configVariables,
    )) {
      let order = 0;
      for (const [name, properties] of Object.entries(
        configVariablesOfCategory,
      )) {
        const existing = await this.prismaConfig().findUnique({
          where: { name_category: { name, category } },
        });

        if (!existing) {
          await this.prismaConfig().create({
            data: {
              order,
              name,
              category,
              ...properties,
            },
          });
        }
        order++;
      }
    }

    for (const [category, vars] of Object.entries(configVariables)) {
      const keys = Object.keys(vars);
      for (let i = 0; i < keys.length; i++) {
        await this.prismaConfig().updateMany({
          where: { name: keys[i], category },
          data: { order: i },
        });
      }
    }
  }

  private async loadYamlConfig() {
    let configFile: string = "";
    try {
      configFile = fs.readFileSync(CONFIG_FILE, "utf8");
    } catch {
      this.logger.log(
        "Config.yaml is not set. Falling back to UI configuration.",
      );
    }
    try {
      this.yamlConfig = yamlParse(configFile);

      if (this.yamlConfig) {
        for (const configVariable of this.configVariables) {
          const category = this.yamlConfig[configVariable.category];
          if (!category) continue;
          configVariable.value = category[configVariable.name];
          this.emit("update", configVariable.name, configVariable.value);
        }
      }
    } catch (e) {
      this.logger.error(
        "Failed to parse config.yaml. Falling back to UI configuration: ",
        e,
      );
    }
  }

  private async migrateInitUser(): Promise<void> {
    if (!this.yamlConfig.initUser.enabled) return;

    const userCount = await this.prismaUser().count({
      where: { isAdmin: true },
    });
    if (userCount === 1) {
      this.logger.log(
        "Skip initial user creation. Admin user is already existent.",
      );
      return;
    }
    await this.prismaUser().create({
      data: {
        email: this.yamlConfig.initUser.email,
        username: this.yamlConfig.initUser.username,
        password: this.yamlConfig.initUser.password
          ? await argon.hash(this.yamlConfig.initUser.password)
          : null,
        isAdmin: this.yamlConfig.initUser.isAdmin,
      },
    });
  }

  get(key: `${string}.${string}`): any {
    const configVariable = this.configVariables.filter(
      (variable) => `${variable.category}.${variable.name}` == key,
    )[0];

    if (!configVariable) throw new Error(`Config variable ${key} not found`);

    const value = configVariable.value ?? configVariable.defaultValue;

    if (configVariable.type == "number" || configVariable.type == "filesize")
      return parseInt(value);
    if (configVariable.type == "boolean") return value == "true";
    if (configVariable.type == "string" || configVariable.type == "text")
      return value;
    if (configVariable.type == "timespan") return stringToTimespan(value);
  }

  async getByCategory(category: string) {
    const configVariables = this.configVariables
      .filter((c) => !c.locked && category == c.category)
      .sort((c) => c.order);

    return configVariables.map((variable) => {
      return {
        ...variable,
        key: `${variable.category}.${variable.name}`,
        value: variable.value ?? variable.defaultValue,
        allowEdit: this.isEditAllowed(),
      };
    });
  }

  async list() {
    const configVariables = this.configVariables.filter((c) => !c.secret);

    return configVariables.map((variable) => {
      return {
        ...variable,
        key: `${variable.category}.${variable.name}`,
        value: variable.value ?? variable.defaultValue,
      };
    });
  }

  async updateMany(data: { key: string; value: string | number | boolean }[]) {
    if (!this.isEditAllowed())
      throw new BadRequestException(
        "You are only allowed to update config variables via the config.yaml file",
      );

    const response: ConfigRow[] = [];

    for (const variable of data) {
      response.push(await this.update(variable.key, variable.value));
    }

    return response;
  }

  async resetEmailTranslationsToDefault() {
    if (!this.isEditAllowed())
      throw new BadRequestException(
        "You are only allowed to update config variables via the config.yaml file",
      );

    const defaults = buildDefaultEmailConfigTranslations();
    const keys = Object.keys(defaults) as EmailConfigTranslationKey[];
    const updated: ConfigRow[] = [];

    for (const key of keys) {
      const configVariable = await this.prismaConfig().update({
        where: {
          name_category: {
            category: "email",
            name: key,
          },
        },
        data: {
          value: JSON.stringify(defaults[key]),
        },
      });
      updated.push(configVariable);
      this.emit("update", `email.${key}`, configVariable.value);
    }

    this.configVariables = await this.prismaConfig().findMany();
    return updated;
  }

  async resetLegalTranslationsToDefault() {
    if (!this.isEditAllowed())
      throw new BadRequestException(
        "You are only allowed to update config variables via the config.yaml file",
      );

    const defaults = buildDefaultLegalConfigTranslations();
    const keys = Object.keys(defaults) as LegalConfigTranslationKey[];
    const updated: ConfigRow[] = [];

    for (const key of keys) {
      const configVariable = await this.prismaConfig().update({
        where: {
          name_category: {
            category: "legal",
            name: key,
          },
        },
        data: {
          value: JSON.stringify(defaults[key]),
        },
      });
      updated.push(configVariable);
      this.emit("update", `legal.${key}`, configVariable.value);
    }

    this.configVariables = await this.prismaConfig().findMany();
    return updated;
  }

  async update(key: string, value: string | number | boolean) {
    if (!this.isEditAllowed())
      throw new BadRequestException(
        "You are only allowed to update config variables via the config.yaml file",
      );

    const configVariable = await this.prismaConfig().findUnique({
      where: {
        name_category: {
          category: key.split(".")[0],
          name: key.split(".")[1],
        },
      },
    });

    if (!configVariable || configVariable.locked)
      throw new NotFoundException("Config variable not found");

    if (value === "") {
      value = null;
    } else if (
      typeof value != configVariable.type &&
      typeof value == "string" &&
      configVariable.type != "text" &&
      configVariable.type != "timespan"
    ) {
      throw new BadRequestException(
        `Config variable must be of type ${configVariable.type}`,
      );
    }

    this.validateConfigVariable(key, value);

    const updatedVariable = await this.prismaConfig().update({
      where: {
        name_category: {
          category: key.split(".")[0],
          name: key.split(".")[1],
        },
      },
      data: { value: value === null ? null : value.toString() },
    });

    this.configVariables = await this.prismaConfig().findMany();

    this.emit("update", key, value);

    return updatedVariable;
  }

  validateConfigVariable(key: string, value: string | number | boolean) {
    const validations = [
      {
        key: "share.shareIdLength",
        condition: (value: number) => value >= 2 && value <= 50,
        message: "Share ID length must be between 2 and 50",
      },
      {
        key: "share.zipCompressionLevel",
        condition: (value: number) => value >= 0 && value <= 9,
        message: "Zip compression level must be between 0 and 9",
      },
      {
        key: "saas.trialDays",
        condition: (value: number) => value >= 0 && value <= 3650,
        message: "SaaS trial days must be between 0 and 3650",
      },
      {
        key: "saas.graceDays",
        condition: (value: number) => value >= 0 && value <= 365,
        message: "SaaS grace days must be between 0 and 365",
      },
      {
        key: "general.logoScalePercent",
        condition: (value: number) => value >= 25 && value <= 250,
        message: "Logo scale must be between 25 and 250 (percent)",
      },
      // TODO add validation for timespan type
    ];

    const validation = validations.find((validation) => validation.key == key);
    if (validation) {
      const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!validation.condition(numValue)) {
        throw new BadRequestException(validation.message);
      }
    }
  }

  isEditAllowed(): boolean {
    return this.yamlConfig === undefined || this.yamlConfig === null;
  }
}
