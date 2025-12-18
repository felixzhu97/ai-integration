import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@repo/langchain";
import type { Message } from "@repo/langchain";

const chatService = new ChatService();

/**
 * POST /api/chat
 * 处理聊天请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messages, systemPrompt, stream: useStream } = body;

    // 验证请求参数
    if (!message && !messages) {
      return NextResponse.json(
        { error: "请提供 message 或 messages 参数" },
        { status: 400 }
      );
    }

    // 如果请求流式响应
    if (useStream) {
      if (!message) {
        return NextResponse.json(
          { error: "流式响应需要提供 message 参数" },
          { status: 400 }
        );
      }

      // 创建流式响应
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chatService.stream(message, systemPrompt)) {
              const data = JSON.stringify(chunk) + "\n";
              controller.enqueue(encoder.encode(data));

              if (chunk.done) {
                controller.close();
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 处理单次对话
    if (message) {
      const response = await chatService.invoke(message, systemPrompt);
      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    // 处理多轮对话
    if (messages && Array.isArray(messages)) {
      // 验证消息格式
      const validMessages: Message[] = messages.filter(
        (msg: unknown): msg is Message => {
          if (
            typeof msg === "object" &&
            msg !== null &&
            "role" in msg &&
            "content" in msg
          ) {
            const m = msg as { role: string; content: string };
            return (
              ["user", "assistant", "system"].includes(m.role) &&
              typeof m.content === "string"
            );
          }
          return false;
        }
      );

      if (validMessages.length === 0) {
        return NextResponse.json(
          { error: "messages 数组为空或格式无效" },
          { status: 400 }
        );
      }

      const response = await chatService.chat(validMessages, systemPrompt);
      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    return NextResponse.json(
      { error: "无效的请求参数" },
      { status: 400 }
    );
  } catch (error) {
    console.error("聊天 API 错误:", error);

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






