import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { configVariables } from "./config-variables";

const databaseUrl =
  process.env.DATABASE_URL || "file:./data/swiss-datashare.db";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: databaseUrl,
  }),
});

async function seedConfigVariables() {
  for (const [category, configVariablesOfCategory] of Object.entries(
    configVariables,
  )) {
    let order = 0;
    for (const [name, properties] of Object.entries(
      configVariablesOfCategory,
    )) {
      const existingConfigVariable = await prisma.config.findUnique({
        where: { name_category: { name, category } },
      });

      if (!existingConfigVariable) {
        await prisma.config.create({
          data: {
            order,
            name,
            ...properties,
            category,
          },
        });
      }
      order++;
    }
  }
}

async function migrateConfigVariables() {
  const existingConfigVariables = await prisma.config.findMany();

  for (const existingConfigVariable of existingConfigVariables) {
    const configVariable =
      configVariables[existingConfigVariable.category]?.[
        existingConfigVariable.name
      ];

    if (!configVariable) {
      await prisma.config.delete({
        where: {
          name_category: {
            name: existingConfigVariable.name,
            category: existingConfigVariable.category,
          },
        },
      });
    } else {
      const variableOrder = Object.keys(
        configVariables[existingConfigVariable.category],
      ).indexOf(existingConfigVariable.name);
      await prisma.config.update({
        where: {
          name_category: {
            name: existingConfigVariable.name,
            category: existingConfigVariable.category,
          },
        },
        data: {
          ...configVariable,
          name: existingConfigVariable.name,
          category: existingConfigVariable.category,
          value: existingConfigVariable.value,
          order: variableOrder,
        },
      });
    }
  }
}

seedConfigVariables()
  .then(() => migrateConfigVariables())
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
