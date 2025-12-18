/**
 * @repo/langchain 主入口
 * 导出所有公共 API
 */

// 导出服务
export { ChatService } from "./services/chat-service.js";

// 导出类型
export type {
  Message,
  MessageRole,
  ChatResponse,
  StreamChunk,
  DeepSeekConfig,
} from "./types/index.js";

// 导出客户端（如果需要直接使用）
export { createChatModel, getDefaultChatModel } from "./client/chat-model.js";

// 导出配置工具（如果需要）
export { getDeepSeekConfig, validateConfig } from "./config/deepseek.js";






