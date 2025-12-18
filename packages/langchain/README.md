# @repo/langchain

LangChain 和 DeepSeek API 集成包。

## 功能

- 封装 LangChain.js 和 DeepSeek API
- 提供类型安全的聊天接口
- 支持单次对话、多轮对话和流式响应

## 安装

在项目根目录运行：

```bash
pnpm install
```

## 使用

### 基本用法

```typescript
import { ChatService } from "@repo/langchain";

const chatService = new ChatService();

// 单次对话
const response = await chatService.invoke("你好");
console.log(response.content);

// 多轮对话
const messages = [
  { role: "user", content: "你好" },
  { role: "assistant", content: "你好！有什么可以帮助你的吗？" },
  { role: "user", content: "介绍一下你自己" }
];
const response2 = await chatService.chat(messages);
```

## 环境变量

需要在环境变量中配置：

- `DEEPSEEK_API_KEY`: DeepSeek API 密钥（必需）
- `DEEPSEEK_BASE_URL`: DeepSeek API 基础 URL（可选，默认为 https://api.deepseek.com）

## API 文档

### ChatService

#### `invoke(message: string): Promise<ChatResponse>`

执行单次对话。

#### `chat(messages: Message[]): Promise<ChatResponse>`

执行多轮对话。

#### `stream(message: string): AsyncIterable<StreamChunk>`

获取流式响应。






