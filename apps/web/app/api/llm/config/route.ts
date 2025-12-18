import { NextRequest, NextResponse } from "next/server";
import { resetLLMLoader } from "@repo/langchain";

/**
 * POST /api/llm/config
 * 更新 LLM 配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, apiKey } = body;

    // 重置全局 LLM 加载器，下次使用时将使用新配置
    resetLLMLoader();

    return NextResponse.json({
      success: true,
      message: "配置已更新",
      config: {
        provider: provider || "ollama",
        model: model || (provider === "deepseek" ? "deepseek-chat" : "llama3"),
      },
    });
  } catch (error) {
    console.error("LLM 配置更新错误:", error);

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

