/**
 * 支持的 LLM 提供商类型
 */
export enum LLMProvider {
  /** Ollama 本地模型 */
  OLLAMA = "ollama",
  /** DeepSeek API */
  DEEPSEEK = "deepseek",
}

/**
 * 支持的嵌入模型类型
 */
export enum EmbeddingsModelType {
  /** Ollama 嵌入模型 */
  OLLAMA = "ollama",
}

/**
 * 向量存储类型
 */
export enum VectorStoreType {
  /** 内存存储 */
  MEMORY = "memory",
  /** 文件系统存储 */
  FILE = "file",
}

/**
 * 文档加载器类型
 */
export enum DocumentLoaderType {
  /** PDF 文档 */
  PDF = "pdf",
  /** 文本文件 */
  TEXT = "text",
  /** 纯文本字符串 */
  STRING = "string",
}

/**
 * 链类型
 */
export enum ChainType {
  /** LLM 链 */
  LLM = "llm",
  /** 顺序链 */
  SEQUENTIAL = "sequential",
  /** 路由链 */
  ROUTER = "router",
}

/**
 * 代理类型
 */
export enum AgentType {
  /** ReAct 代理 */
  REACT = "react",
  /** 工具调用代理 */
  TOOL_CALLING = "tool-calling",
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  /** 默认提供商 */
  DEFAULT_PROVIDER: "ollama" as const,
  /** 默认模型 */
  DEFAULT_MODEL: "llama3",
  /** DeepSeek 默认模型 */
  DEFAULT_DEEPSEEK_MODEL: "deepseek-chat",
  /** DeepSeek API 基础 URL */
  DEFAULT_DEEPSEEK_BASE_URL: "https://api.deepseek.com",
  /** 默认嵌入模型 */
  DEFAULT_EMBEDDINGS_MODEL: "nomic-embed-text",
  /** 默认 Ollama 基础 URL */
  DEFAULT_BASE_URL: "http://localhost:11434",
  /** 默认温度 */
  DEFAULT_TEMPERATURE: 0.7,
  /** 默认最大 token 数 */
  DEFAULT_MAX_TOKENS: 2048,
  /** 默认块大小 */
  DEFAULT_CHUNK_SIZE: 1000,
  /** 默认块重叠 */
  DEFAULT_CHUNK_OVERLAP: 200,
  /** 默认检索数量 */
  DEFAULT_RETRIEVAL_K: 4,
  /** 默认向量维度 */
  DEFAULT_DIMENSIONS: 768,
} as const;
