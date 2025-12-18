import { ChatOpenAI } from "@langchain/openai";
import { getDeepSeekConfig, validateConfig } from "../config/deepseek.js";
import type { DeepSeekConfig } from "../types/index.js";

/**
 * 创建 DeepSeek 聊天模型实例
 */
export function createChatModel(config?: Partial<DeepSeekConfig>): ChatOpenAI {
  const defaultConfig = getDeepSeekConfig();
  const finalConfig = { ...defaultConfig, ...config };

  validateConfig(finalConfig);

  return new ChatOpenAI({
    modelName: finalConfig.model,
    openAIApiKey: finalConfig.apiKey,
    configuration: {
      baseURL: finalConfig.baseURL,
    },
    temperature: finalConfig.temperature,
    maxTokens: finalConfig.maxTokens,
  });
}

/**
 * 获取默认的聊天模型实例
 */
export function getDefaultChatModel(): ChatOpenAI {
  return createChatModel();
}






