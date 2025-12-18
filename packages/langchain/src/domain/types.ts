/**
 * 消息角色
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * 消息接口
 */
export interface Message {
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
}

/**
 * 文档接口
 */
export interface Document {
  /** 文档内容 */
  pageContent: string;
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 文档分块选项
 */
export interface DocumentChunkOptions {
  /** 块大小（字符数） */
  chunkSize?: number;
  /** 块重叠（字符数） */
  chunkOverlap?: number;
}

/**
 * 向量存储检索结果
 */
export interface VectorStoreRetrievalResult {
  /** 文档内容 */
  pageContent: string;
  /** 元数据 */
  metadata?: Record<string, unknown>;
  /** 相似度分数 */
  score?: number;
}

/**
 * RAG 查询结果
 */
export interface RAGQueryResult {
  /** 生成的回答 */
  answer: string;
  /** 检索到的相关文档 */
  sources: VectorStoreRetrievalResult[];
}

/**
 * 链配置
 */
export interface ChainConfig {
  /** 链类型 */
  type: "llm" | "sequential" | "router";
  /** 提示词模板 */
  prompt?: string;
  /** 输出键 */
  outputKey?: string;
}

/**
 * 代理配置
 */
export interface AgentConfig {
  /** 代理类型 */
  type: "react" | "tool-calling";
  /** 工具列表 */
  tools?: string[];
  /** 最大迭代次数 */
  maxIterations?: number;
}

/**
 * 记忆类型
 */
export type MemoryType = "buffer" | "summary" | "vector";

/**
 * 记忆配置
 */
export interface MemoryConfig {
  /** 记忆类型 */
  type: MemoryType;
  /** 最大历史长度（buffer 类型） */
  maxHistoryLength?: number;
  /** 是否返回消息历史 */
  returnMessages?: boolean;
}

/**
 * 工具定义
 */
export interface ToolDefinition {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 工具参数模式（JSON Schema） */
  schema?: Record<string, unknown>;
}

/**
 * 工具执行结果
 */
export interface ToolResult {
  /** 工具名称 */
  tool: string;
  /** 执行结果 */
  result: unknown;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 流式响应块
 */
export interface StreamChunk {
  /** 内容块 */
  content: string;
  /** 是否完成 */
  done: boolean;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * LLM 配置
 */
export interface LLMConfig {
  /** 提供商类型（ollama 或 deepseek） */
  provider?: "ollama" | "deepseek";
  /** 模型名称 */
  model: string;
  /** 基础 URL（Ollama 地址或 DeepSeek API 地址） */
  baseUrl?: string;
  /** API Key（DeepSeek 需要） */
  apiKey?: string;
  /** 温度 */
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 其他参数 */
  [key: string]: unknown;
}

/**
 * 嵌入模型配置
 */
export interface EmbeddingsConfig {
  /** 模型名称 */
  model: string;
  /** 基础 URL（Ollama 地址） */
  baseUrl?: string;
}

/**
 * 向量存储配置
 */
export interface VectorStoreConfig {
  /** 存储类型 */
  type: "memory" | "file";
  /** 持久化路径（file 类型） */
  persistPath?: string;
  /** 向量维度 */
  dimensions?: number;
}
