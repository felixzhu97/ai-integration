import { OllamaEmbeddings } from "@langchain/ollama";
import type { EmbeddingsConfig } from "../domain/types";
import { DEFAULT_CONFIG } from "../domain/models";

/**
 * 嵌入模型加载器
 * 负责加载和管理 Ollama 嵌入模型
 */
export class EmbeddingsLoader {
  private embeddings: OllamaEmbeddings | null = null;
  private config: EmbeddingsConfig;

  constructor(config?: Partial<EmbeddingsConfig>) {
    this.config = {
      model: config?.model || DEFAULT_CONFIG.DEFAULT_EMBEDDINGS_MODEL,
      baseUrl: config?.baseUrl || DEFAULT_CONFIG.DEFAULT_BASE_URL,
      ...config,
    };
  }

  /**
   * 获取或创建嵌入模型实例
   */
  getEmbeddings(): OllamaEmbeddings {
    if (!this.embeddings) {
      this.embeddings = new OllamaEmbeddings({
        model: this.config.model as string,
        baseUrl: this.config.baseUrl as string,
      });
    }
    return this.embeddings;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<EmbeddingsConfig>): void {
    this.config = { ...this.config, ...config };
    // 重新创建嵌入模型实例以应用新配置
    this.embeddings = null;
  }

  /**
   * 获取当前配置
   */
  getConfig(): EmbeddingsConfig {
    return { ...this.config };
  }

  /**
   * 检查嵌入模型是否已初始化
   */
  isInitialized(): boolean {
    return this.embeddings !== null;
  }

  /**
   * 重置嵌入模型实例
   */
  reset(): void {
    this.embeddings = null;
  }
}

/**
 * 全局嵌入模型加载器实例（单例模式）
 */
let globalEmbeddingsLoader: EmbeddingsLoader | null = null;

/**
 * 获取全局嵌入模型加载器
 */
export function getEmbeddingsLoader(
  config?: Partial<EmbeddingsConfig>
): EmbeddingsLoader {
  if (!globalEmbeddingsLoader) {
    globalEmbeddingsLoader = new EmbeddingsLoader(config);
  }
  return globalEmbeddingsLoader;
}

/**
 * 重置全局嵌入模型加载器
 */
export function resetEmbeddingsLoader(): void {
  if (globalEmbeddingsLoader) {
    globalEmbeddingsLoader.reset();
    globalEmbeddingsLoader = null;
  }
}



