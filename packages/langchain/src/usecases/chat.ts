import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import type { Message, StreamChunk, LLMConfig } from "../domain/types";
import { getLLMLoader } from "../infrastructure/llm-loader";

/**
 * 聊天服务
 * 提供基础的 LLM 调用功能，支持单次调用、多轮对话和流式响应
 */
export class ChatService {
  private llmLoader = getLLMLoader();

  constructor(config?: Partial<LLMConfig>) {
    if (config) {
      this.llmLoader.updateConfig(config);
    }
  }

  /**
   * 单次调用
   */
  async invoke(
    message: string,
    systemPrompt?: string
  ): Promise<string> {
    const llm = this.llmLoader.getLLM();
    const messages = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(message));

    const response = await llm.invoke(messages);
    return response.content as string;
  }

  /**
   * 多轮对话
   */
  async chat(
    messages: Message[],
    systemPrompt?: string
  ): Promise<string> {
    const llm = this.llmLoader.getLLM();
    const langchainMessages = [];

    if (systemPrompt) {
      langchainMessages.push(new SystemMessage(systemPrompt));
    }

    for (const msg of messages) {
      switch (msg.role) {
        case "user":
          langchainMessages.push(new HumanMessage(msg.content));
          break;
        case "assistant":
          langchainMessages.push(new AIMessage(msg.content));
          break;
        case "system":
          langchainMessages.push(new SystemMessage(msg.content));
          break;
      }
    }

    const response = await llm.invoke(langchainMessages);
    return response.content as string;
  }

  /**
   * 流式响应
   */
  async *stream(
    message: string,
    systemPrompt?: string
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const llm = this.llmLoader.getLLM();
    const messages = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(message));

    try {
      const stream = await llm.stream(messages);

      for await (const chunk of stream) {
        yield {
          content: chunk.content as string,
          done: false,
        };
      }

      yield {
        content: "",
        done: true,
      };
    } catch (error) {
      yield {
        content: "",
        done: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.llmLoader.updateConfig(config);
  }

  /**
   * 获取配置
   */
  getConfig(): LLMConfig {
    return this.llmLoader.getConfig();
  }
}



