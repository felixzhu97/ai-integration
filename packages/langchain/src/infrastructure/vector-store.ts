import type { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import type { VectorStoreConfig, VectorStoreRetrievalResult } from "../domain/types";
import { VectorStoreType, DEFAULT_CONFIG } from "../domain/models";
import { getEmbeddingsLoader } from "./embeddings";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * 向量存储管理器
 * 支持内存和文件系统两种存储方式
 */
export class VectorStoreManager {
  private vectorStore: VectorStore | null = null;
  private config: VectorStoreConfig;
  private embeddings = getEmbeddingsLoader();

  constructor(config?: Partial<VectorStoreConfig>) {
    this.config = {
      type: config?.type || VectorStoreType.MEMORY,
      persistPath: config?.persistPath,
      dimensions: config?.dimensions || DEFAULT_CONFIG.DEFAULT_DIMENSIONS,
      ...config,
    };
  }

  /**
   * 初始化向量存储
   */
  async initialize(): Promise<void> {
    if (this.vectorStore) {
      return;
    }

    // 动态导入 HNSWLib（仅在服务器端使用）
    const { HNSWLib } = await import("@langchain/community/vectorstores/hnswlib");
    const embeddings = this.embeddings.getEmbeddings();

    if (this.config.type === VectorStoreType.FILE && this.config.persistPath) {
      // 尝试从文件加载
      try {
        const exists = await fs
          .access(this.config.persistPath)
          .then(() => true)
          .catch(() => false);

        if (exists) {
          this.vectorStore = await HNSWLib.load(
            this.config.persistPath,
            embeddings
          );
          return;
        }
      } catch (error) {
        console.warn("无法加载持久化的向量存储，将创建新的:", error);
      }
    }

    // 创建新的向量存储
    this.vectorStore = await HNSWLib.fromDocuments(
      [],
      embeddings,
      {
        space: "cosine",
        numDimensions: this.config.dimensions,
      }
    );
  }

  /**
   * 添加文档到向量存储
   */
  async addDocuments(documents: Document[]): Promise<void> {
    await this.initialize();

    if (!this.vectorStore) {
      throw new Error("向量存储未初始化");
    }

    await this.vectorStore.addDocuments(documents);
  }

  /**
   * 添加文本到向量存储
   */
  async addTexts(
    texts: string[],
    metadatas?: Record<string, unknown>[]
  ): Promise<void> {
    await this.initialize();

    if (!this.vectorStore) {
      throw new Error("向量存储未初始化");
    }

    await this.vectorStore.addTexts(texts, metadatas);
  }

  /**
   * 相似度搜索
   */
  async similaritySearch(
    query: string,
    k: number = DEFAULT_CONFIG.DEFAULT_RETRIEVAL_K
  ): Promise<VectorStoreRetrievalResult[]> {
    await this.initialize();

    if (!this.vectorStore) {
      throw new Error("向量存储未初始化");
    }

    const results = await this.vectorStore.similaritySearchWithScore(query, k);

    return results.map(([doc, score]) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
      score,
    }));
  }

  /**
   * 保存向量存储到文件
   */
  async save(persistPath?: string): Promise<void> {
    if (!this.vectorStore) {
      throw new Error("向量存储未初始化");
    }

    const savePath = persistPath || this.config.persistPath;
    if (!savePath) {
      throw new Error("未指定持久化路径");
    }

    // 确保目录存在
    const dir = path.dirname(savePath);
    await fs.mkdir(dir, { recursive: true });

    await this.vectorStore.save(savePath);
  }

  /**
   * 从文件加载向量存储
   */
  async load(loadPath?: string): Promise<void> {
    const loadPathToUse = loadPath || this.config.persistPath;
    if (!loadPathToUse) {
      throw new Error("未指定加载路径");
    }

    const { HNSWLib } = await import("@langchain/community/vectorstores/hnswlib");
    const embeddings = this.embeddings.getEmbeddings();
    this.vectorStore = await HNSWLib.load(loadPathToUse, embeddings);
  }

  /**
   * 清空向量存储
   */
  async clear(): Promise<void> {
    if (this.vectorStore) {
      // 重新创建空的向量存储
      const { HNSWLib } = await import("@langchain/community/vectorstores/hnswlib");
      const embeddings = this.embeddings.getEmbeddings();
      this.vectorStore = await HNSWLib.fromDocuments([], embeddings, {
        space: "cosine",
        numDimensions: this.config.dimensions,
      });
    }
  }

  /**
   * 获取向量存储实例
   */
  getVectorStore(): VectorStore {
    if (!this.vectorStore) {
      throw new Error("向量存储未初始化，请先调用 initialize()");
    }
    return this.vectorStore;
  }

  /**
   * 检查向量存储是否已初始化
   */
  isInitialized(): boolean {
    return this.vectorStore !== null;
  }

  /**
   * 重置向量存储
   */
  reset(): void {
    this.vectorStore = null;
  }
}

