import type { DeepSeekConfig } from "../types/index.js";

/**
 * 从环境变量获取 DeepSeek 配置
 */
export function getDeepSeekConfig(): DeepSeekConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY 环境变量未设置。请在 .env.local 文件中设置 DEEPSEEK_API_KEY。"
    );
  }

  return {
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    temperature: process.env.DEEPSEEK_TEMPERATURE
      ? parseFloat(process.env.DEEPSEEK_TEMPERATURE)
      : 0.7,
    maxTokens: process.env.DEEPSEEK_MAX_TOKENS
      ? parseInt(process.env.DEEPSEEK_MAX_TOKENS, 10)
      : 2000,
  };
}

/**
 * 验证配置是否有效
 */
export function validateConfig(config: DeepSeekConfig): void {
  if (!config.apiKey || config.apiKey.trim() === "") {
    throw new Error("DeepSeek API Key 不能为空");
  }

  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 2) {
      throw new Error("Temperature 必须在 0 到 2 之间");
    }
  }

  if (config.maxTokens !== undefined) {
    if (config.maxTokens < 1) {
      throw new Error("MaxTokens 必须大于 0");
    }
  }
}






