import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { createChatModel } from "../client/chat-model.js";
import type { Message, ChatResponse, StreamChunk, DeepSeekConfig } from "../types/index.js";

/**
 * 聊天服务类
 * 提供高级 API 用于与 DeepSeek 模型交互
 */
export class ChatService {
  private chatModel;

  constructor(config?: Partial<DeepSeekConfig>) {
    this.chatModel = createChatModel(config);
  }

  /**
   * 执行单次对话
   * @param message 用户消息
   * @param systemPrompt 可选的系统提示词
   * @returns 聊天响应
   */
  async invoke(message: string, systemPrompt?: string): Promise<ChatResponse> {
    try {
      const messages = [];

      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }

      messages.push(new HumanMessage(message));

      const response = await this.chatModel.invoke(messages);

      return {
        content: response.content as string,
        usage: response.response_metadata?.tokenUsage
          ? {
              promptTokens: response.response_metadata.tokenUsage.promptTokens,
              completionTokens:
                response.response_metadata.tokenUsage.completionTokens,
              totalTokens: response.response_metadata.tokenUsage.totalTokens,
            }
          : undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 执行多轮对话
   * @param messages 消息历史
   * @param systemPrompt 可选的系统提示词
   * @returns 聊天响应
   */
  async chat(
    messages: Message[],
    systemPrompt?: string
  ): Promise<ChatResponse> {
    try {
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

      const response = await this.chatModel.invoke(langchainMessages);

      return {
        content: response.content as string,
        usage: response.response_metadata?.tokenUsage
          ? {
              promptTokens: response.response_metadata.tokenUsage.promptTokens,
              completionTokens:
                response.response_metadata.tokenUsage.completionTokens,
              totalTokens: response.response_metadata.tokenUsage.totalTokens,
            }
          : undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 获取流式响应
   * @param message 用户消息
   * @param systemPrompt 可选的系统提示词
   * @returns 异步迭代器，产生流式响应块
   */
  async *stream(
    message: string,
    systemPrompt?: string
  ): AsyncIterable<StreamChunk> {
    try {
      const messages = [];

      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }

      messages.push(new HumanMessage(message));

      const stream = await this.chatModel.stream(messages);

      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.content as string;
        fullContent += content;

        yield {
          content,
          done: false,
        };
      }

      // 发送完成信号
      yield {
        content: "",
        done: true,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      // 如果是 API 错误，提供更友好的错误消息
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        return new Error("DeepSeek API 密钥无效，请检查 DEEPSEEK_API_KEY 环境变量");
      }
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        return new Error("API 请求频率过高，请稍后重试");
      }
      if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
        return new Error("DeepSeek API 服务器错误，请稍后重试");
      }
      return error;
    }
    return new Error("未知错误：" + String(error));
  }
}






