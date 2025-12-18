import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@repo/langchain";
import { MemoryService } from "@repo/langchain";
import type { Message } from "@repo/langchain";

// 使用单例模式，保持记忆状态
let memoryService: MemoryService | null = null;

function getMemoryService(): MemoryService {
  if (!memoryService) {
    memoryService = new MemoryService({
      type: "buffer",
      returnMessages: false,
    });
  }
  return memoryService;
}

const chatService = new ChatService();

/**
 * POST /api/memory/chat
 * 带记忆的聊天
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "请提供有效的消息" },
        { status: 400 }
      );
    }

    const memory = getMemoryService();
    await memory.initialize();

    // 如果有历史记录，先保存到记忆
    if (history && Array.isArray(history)) {
      for (let i = 0; i < history.length - 1; i += 2) {
        if (history[i]?.role === "user" && history[i + 1]?.role === "assistant") {
          await memory.saveContext(
            history[i].content,
            history[i + 1].content
          );
        }
      }
    }

    // 获取记忆上下文
    const memoryVariables = await memory.loadMemoryVariables();
    const context = memoryVariables.history
      ? String(memoryVariables.history)
      : "";

    // 构建提示词
    const systemPrompt = context
      ? `以下是之前的对话历史：\n${context}\n\n请基于历史对话回答用户的问题。`
      : undefined;

    // 调用聊天服务
    const response = await chatService.invoke(message, systemPrompt);

    // 保存到记忆
    await memory.saveContext(message, response);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("记忆聊天错误:", error);

    const errorMessage =
      error instanceof Error ? error.message : "服务器内部错误";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}



