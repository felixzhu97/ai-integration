import { NextRequest, NextResponse } from "next/server";
import { ChainService } from "@repo/langchain";

const chainService = new ChainService();

/**
 * POST /api/chains
 * 执行链
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "请提供有效的输入" },
        { status: 400 }
      );
    }

    // 创建一个简单的 LLM 链
    const prompt = "请对以下内容进行总结和分析：{input}";
    const result = await chainService.runLLMChain(prompt, { input });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("链执行错误:", error);

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



