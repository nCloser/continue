import * as z from "zod";
import { dataSchema } from "./data/index.js";
import { modelSchema, partialModelSchema } from "./models.js";

export const contextSchema = z.object({
  provider: z.string(),
  params: z.any().optional(),
});

const mcpServerSchema = z.object({
  name: z.string(),
  command: z.string(),
  faviconUrl: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
});

const promptSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  prompt: z.string(),
});

const docSchema = z.object({
  name: z.string(),
  startUrl: z.string(),
  rootUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

const ruleObjectSchema = z.object({
  name: z.string(),
  rule: z.string(),
  if: z.string().optional(),
});

const ruleSchema = z.union([z.string(), ruleObjectSchema]);

export type Rule = z.infer<typeof ruleSchema>;

export const blockItemWrapperSchema = <T extends z.AnyZodObject>(schema: T) =>
  z.object({
    uses: z.string(),
    with: z.record(z.string()).optional(),
    override: schema.partial().optional(),
  });

export const blockOrSchema = <T extends z.AnyZodObject>(schema: T) =>
  z.union([schema, blockItemWrapperSchema(schema)]);

export const baseConfigYamlSchema = z.object({
  name: z.string(),
  version: z.string(),
  schema: z.string().optional(),
});

export const configYamlSchema = baseConfigYamlSchema.extend({
  models: z
    .array(
      z.union([
        modelSchema,
        z.object({
          uses: z.string(),
          with: z.record(z.string()).optional(),
          override: partialModelSchema.optional(),
        }),
      ]),
    )
    .optional(),
  context: z.array(blockOrSchema(contextSchema)).optional(),
  data: z.array(blockOrSchema(dataSchema)).optional(),
  mcpServers: z.array(blockOrSchema(mcpServerSchema)).optional(),
  rules: z
    .array(
      z.union([
        ruleSchema,
        z.object({
          uses: z.string(),
          with: z.record(z.string()).optional(),
        }),
      ]),
    )
    .optional(),
  prompts: z.array(blockOrSchema(promptSchema)).optional(),
  docs: z.array(blockOrSchema(docSchema)).optional(),
});

export type ConfigYaml = z.infer<typeof configYamlSchema>;

export const assistantUnrolledSchema = baseConfigYamlSchema.extend({
  models: z.array(modelSchema.nullable()).optional(),
  context: z.array(contextSchema.nullable()).optional(),
  data: z.array(dataSchema.nullable()).optional(),
  mcpServers: z.array(mcpServerSchema.nullable()).optional(),
  rules: z.array(ruleSchema.nullable()).optional(),
  prompts: z.array(promptSchema.nullable()).optional(),
  docs: z.array(docSchema.nullable()).optional(),
});

export type AssistantUnrolled = z.infer<typeof assistantUnrolledSchema>;

export const assistantUnrolledSchemaNonNullable = baseConfigYamlSchema.extend({
  models: z.array(modelSchema).optional(),
  context: z.array(contextSchema).optional(),
  data: z.array(dataSchema).optional(),
  mcpServers: z.array(mcpServerSchema).optional(),
  rules: z.array(ruleSchema).optional(),
  prompts: z.array(promptSchema).optional(),
  docs: z.array(docSchema).optional(),
});

export type AssistantUnrolledNonNullable = z.infer<
  typeof assistantUnrolledSchemaNonNullable
>;

export const isAssistantUnrolledNonNullable = (
  a: AssistantUnrolled,
): a is AssistantUnrolledNonNullable =>
  (!a.models || a.models.every((m) => m !== null)) &&
  (!a.context || a.context.every((c) => c !== null)) &&
  (!a.data || a.data.every((d) => d !== null)) &&
  (!a.mcpServers || a.mcpServers.every((s) => s !== null)) &&
  (!a.rules || a.rules.every((r) => r !== null)) &&
  (!a.prompts || a.prompts.every((p) => p !== null)) &&
  (!a.docs || a.docs.every((d) => d !== null));

export const blockSchema = baseConfigYamlSchema.and(
  z.union([
    z.object({ models: z.array(modelSchema).length(1) }),
    z.object({ context: z.array(contextSchema).length(1) }),
    z.object({ data: z.array(dataSchema).length(1) }),
    z.object({ mcpServers: z.array(mcpServerSchema).length(1) }),
    z.object({
      rules: z.array(ruleSchema).length(1),
    }),
    z.object({ prompts: z.array(promptSchema).length(1) }),
    z.object({ docs: z.array(docSchema).length(1) }),
  ]),
);

export type Block = z.infer<typeof blockSchema>;
