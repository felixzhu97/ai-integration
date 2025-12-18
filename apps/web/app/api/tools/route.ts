import { NextRequest, NextResponse } from "next/server";
import { ToolService } from "@repo/langchain";

const toolService = new ToolService();

/**
 * POST /api/tools
 * 执行工具
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, toolName } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "请提供有效的输入" },
        { status: 400 }
      );
    }

    // 尝试解析数学表达式
    let result: string;
    if (toolName === "calculator" || input.match(/^[\d+\-*/().\s]+$/)) {
      // 使用计算器工具
      const toolResult = await toolService.executeTool(
        "calculator",
        { expression: input },
        []
      );
      result = toolResult.error
        ? `错误: ${toolResult.error}`
        : String(toolResult.result);
    } else {
      result = `输入: ${input}\n\n这是一个工具调用示例。实际工具执行需要根据具体需求实现。`;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("工具执行错误:", error);

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

