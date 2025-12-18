import {
  ConversationBufferMemory,
  ConversationSummaryMemory,
} from "langchain/memory";
import { BufferMemory } from "langchain/memory";
import type { MemoryConfig, Message } from "../domain/types";
import { MemoryType } from "../domain/types";
import { getLLMLoader } from "../infrastructure/llm-loader";
import { VectorStoreManager } from "../infrastructure/vector-store";

/**
 * 记忆服务
 * 提供对话记忆管理功能
 */
export class MemoryService {
  private memory: BufferMemory | ConversationBufferMemory | ConversationSummaryMemory | null = null;
  private config: MemoryConfig;
  private llmLoader = getLLMLoader();
  private vectorStore?: VectorStoreManager;

  constructor(config: MemoryConfig) {
    this.config = config;
  }

  /**
   * 初始化记忆
   */
  async initialize(): Promise<void> {
    const llm = this.llmLoader.getLLM();

    switch (this.config.type) {
      case MemoryType.BUFFER:
        this.memory = new ConversationBufferMemory({
          returnMessages: this.config.returnMessages ?? false,
          memoryKey: "history",
        });
        break;

      case MemoryType.SUMMARY:
        this.memory = new ConversationSummaryMemory({
          llm,
          returnMessages: this.config.returnMessages ?? false,
          memoryKey: "history",
        });
        break;

      case MemoryType.VECTOR:
        if (!this.vectorStore) {
          this.vectorStore = new VectorStoreManager();
          await this.vectorStore.initialize();
        }
        // 向量存储记忆需要特殊处理，这里使用 BufferMemory 作为基础
        this.memory = new ConversationBufferMemory({
          returnMessages: this.config.returnMessages ?? false,
          memoryKey: "history",
        });
        break;

      default:
        throw new Error(`不支持的记忆类型: ${this.config.type}`);
    }
  }

  /**
   * 保存上下文
   */
  async saveContext(input: string, output: string): Promise<void> {
    if (!this.memory) {
      await this.initialize();
    }

    if (this.config.type === MemoryType.VECTOR && this.vectorStore) {
      // 对于向量存储记忆，将对话保存到向量存储
      await this.vectorStore.addTexts(
        [`用户: ${input}\n助手: ${output}`],
        [{ type: "conversation", input, output }]
      );
    }

    if (this.memory) {
      await this.memory.saveContext({ input }, { output });
    }
  }

  /**
   * 加载上下文
   */
  async loadMemoryVariables(): Promise<Record<string, unknown>> {
    if (!this.memory) {
      await this.initialize();
    }

    if (this.memory) {
      return await this.memory.loadMemoryVariables({});
    }

    return {};
  }

  /**
   * 获取消息历史
   */
  async getHistory(): Promise<Message[]> {
    const variables = await this.loadMemoryVariables();
    const history = variables.history;

    if (Array.isArray(history)) {
      return history.map((msg: { type: string; content: string }) => ({
        role: msg.type === "human" ? "user" : "assistant",
        content: msg.content,
      }));
    }

    if (typeof history === "string") {
      // 如果是字符串格式的历史，尝试解析
      const lines = history.split("\n");
      const messages: Message[] = [];

      for (const line of lines) {
        if (line.startsWith("Human:")) {
          messages.push({
            role: "user",
            content: line.replace("Human:", "").trim(),
          });
        } else if (line.startsWith("AI:")) {
          messages.push({
            role: "assistant",
            content: line.replace("AI:", "").trim(),
          });
        }
      }

      return messages;
    }

    return [];
  }

  /**
   * 清空记忆
   */
  async clear(): Promise<void> {
    if (this.memory) {
      await this.memory.clear();
    }

    if (this.vectorStore) {
      await this.vectorStore.clear();
    }
  }

  /**
   * 获取记忆实例
   */
  getMemory(): BufferMemory | ConversationBufferMemory | ConversationSummaryMemory | null {
    return this.memory;
  }
}



