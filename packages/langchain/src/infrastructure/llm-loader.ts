import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { LLMConfig } from "../domain/types";
import { DEFAULT_CONFIG, LLMProvider } from "../domain/models";

/**
 * LLM 加载器
 * 负责加载和管理多种 LLM 模型（Ollama、DeepSeek 等）
 */
export class LLMLoader {
  private llm: BaseChatModel | null = null;
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    const provider = config?.provider || DEFAULT_CONFIG.DEFAULT_PROVIDER;
    const isDeepSeek = provider === "deepseek";

    this.config = {
      provider,
      model:
        config?.model ||
        (isDeepSeek
          ? DEFAULT_CONFIG.DEFAULT_DEEPSEEK_MODEL
          : DEFAULT_CONFIG.DEFAULT_MODEL),
      baseUrl:
        config?.baseUrl ||
        (isDeepSeek
          ? DEFAULT_CONFIG.DEFAULT_DEEPSEEK_BASE_URL
          : DEFAULT_CONFIG.DEFAULT_BASE_URL),
      apiKey: config?.apiKey,
      temperature: config?.temperature ?? DEFAULT_CONFIG.DEFAULT_TEMPERATURE,
      maxTokens: config?.maxTokens ?? DEFAULT_CONFIG.DEFAULT_MAX_TOKENS,
      ...config,
    };
  }

  /**
   * 获取或创建 LLM 实例
   */
  getLLM(): BaseChatModel {
    if (!this.llm) {
      const provider = this.config.provider || DEFAULT_CONFIG.DEFAULT_PROVIDER;

      if (provider === "deepseek") {
        // DeepSeek 使用 OpenAI 兼容的 API
        if (!this.config.apiKey) {
          throw new Error("DeepSeek 需要提供 API Key");
        }

        this.llm = new ChatOpenAI({
          modelName: this.config.model as string,
          openAIApiKey: this.config.apiKey,
          configuration: {
            baseURL: this.config.baseUrl as string,
          },
          temperature: this.config.temperature as number,
          maxTokens: this.config.maxTokens as number,
        });
      } else {
        // 默认使用 Ollama
        this.llm = new ChatOllama({
          model: this.config.model as string,
          baseUrl: this.config.baseUrl as string,
          temperature: this.config.temperature as number,
          ...(this.config.maxTokens && {
            numCtx: this.config.maxTokens as number,
          }),
        });
      }
    }
    return this.llm;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    // 重新创建 LLM 实例以应用新配置
    this.llm = null;
  }

  /**
   * 获取当前配置
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /**
   * 检查 LLM 是否已初始化
   */
  isInitialized(): boolean {
    return this.llm !== null;
  }

  /**
   * 重置 LLM 实例
   */
  reset(): void {
    this.llm = null;
  }
}

/**
 * 全局 LLM 加载器实例（单例模式）
 */
let globalLLMLoader: LLMLoader | null = null;

/**
 * 获取全局 LLM 加载器
 */
export function getLLMLoader(config?: Partial<LLMConfig>): LLMLoader {
  if (!globalLLMLoader) {
    globalLLMLoader = new LLMLoader(config);
  }
  return globalLLMLoader;
}

/**
 * 重置全局 LLM 加载器
 */
export function resetLLMLoader(): void {
  if (globalLLMLoader) {
    globalLLMLoader.reset();
    globalLLMLoader = null;
  }
}
