import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import type {
  RAGQueryResult,
  VectorStoreRetrievalResult,
  VectorStoreConfig,
} from "../domain/types";
import { DEFAULT_CONFIG } from "../domain/models";
import { VectorStoreManager } from "../infrastructure/vector-store";
import { getLLMLoader } from "../infrastructure/llm-loader";
import { DocumentLoaderService } from "./document-loader";

/**
 * RAG 服务
 * 实现检索增强生成功能
 */
export class RAGService {
  private vectorStore: VectorStoreManager;
  private llmLoader = getLLMLoader();
  private documentLoader = new DocumentLoaderService();

  constructor(vectorStoreConfig?: Partial<VectorStoreConfig>) {
    this.vectorStore = new VectorStoreManager(vectorStoreConfig);
  }

  /**
   * 添加文档到向量存储
   */
  async addDocuments(documents: Document[]): Promise<void> {
    await this.vectorStore.addDocuments(documents);
  }

  /**
   * 从文件加载并索引文档
   */
  async loadAndIndexDocument(
    filePath: string,
    chunkSize?: number,
    chunkOverlap?: number
  ): Promise<void> {
    const documents = await this.documentLoader.loadFromFile(filePath);
    const chunks = await this.documentLoader.chunkDocuments(documents, {
      chunkSize,
      chunkOverlap,
    });
    await this.vectorStore.addDocuments(chunks);
  }

  /**
   * 从字符串加载并索引文档
   */
  async loadAndIndexText(
    text: string,
    metadata?: Record<string, unknown>,
    chunkSize?: number,
    chunkOverlap?: number
  ): Promise<void> {
    const documents = this.documentLoader.loadFromString(text, metadata);
    const chunks = await this.documentLoader.chunkDocuments(documents, {
      chunkSize,
      chunkOverlap,
    });
    await this.vectorStore.addDocuments(chunks);
  }

  /**
   * RAG 查询
   */
  async query(
    question: string,
    k: number = DEFAULT_CONFIG.DEFAULT_RETRIEVAL_K
  ): Promise<RAGQueryResult> {
    // 检索相关文档
    const retrievedDocs = await this.vectorStore.similaritySearch(question, k);

    // 构建上下文
    const context = retrievedDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");

    // 构建提示词
    const promptTemplate = PromptTemplate.fromTemplate(
      `基于以下上下文信息回答问题。如果上下文中没有相关信息，请说明你不知道。

上下文：
{context}

问题：{question}

回答：`
    );

    const prompt = await promptTemplate.format({
      context,
      question,
    });

    // 生成回答
    const llm = this.llmLoader.getLLM();
    const response = await llm.invoke([prompt]);

    return {
      answer: response.content as string,
      sources: retrievedDocs,
    };
  }

  /**
   * 流式 RAG 查询
   */
  async *queryStream(
    question: string,
    k: number = DEFAULT_CONFIG.DEFAULT_RETRIEVAL_K
  ): AsyncGenerator<{ content: string; done: boolean; sources?: VectorStoreRetrievalResult[] }, void, unknown> {
    // 检索相关文档
    const retrievedDocs = await this.vectorStore.similaritySearch(question, k);

    // 构建上下文
    const context = retrievedDocs
      .map((doc) => doc.pageContent)
      .join("\n\n");

    // 构建提示词
    const promptTemplate = PromptTemplate.fromTemplate(
      `基于以下上下文信息回答问题。如果上下文中没有相关信息，请说明你不知道。

上下文：
{context}

问题：{question}

回答：`
    );

    const prompt = await promptTemplate.format({
      context,
      question,
    });

    // 流式生成回答
    const llm = this.llmLoader.getLLM();
    const stream = await llm.stream([prompt]);

    for await (const chunk of stream) {
      yield {
        content: chunk.content as string,
        done: false,
      };
    }

    yield {
      content: "",
      done: true,
      sources: retrievedDocs,
    };
  }

  /**
   * 保存向量存储
   */
  async save(persistPath?: string): Promise<void> {
    await this.vectorStore.save(persistPath);
  }

  /**
   * 清空向量存储
   */
  async clear(): Promise<void> {
    await this.vectorStore.clear();
  }

  /**
   * 获取向量存储管理器
   */
  getVectorStore(): VectorStoreManager {
    return this.vectorStore;
  }
}

