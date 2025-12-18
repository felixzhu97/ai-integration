/**
 * 消息角色类型
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * 消息接口
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * 聊天响应接口
 */
export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * 流式响应块接口
 */
export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * DeepSeek 配置接口
 */
export interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}






