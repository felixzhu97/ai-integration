import { NextRequest, NextResponse } from "next/server";
import { AgentService } from "@repo/langchain";

const agentService = new AgentService();

/**
 * POST /api/agents
 * 执行代理任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "请提供有效的任务描述" },
        { status: 400 }
      );
    }

    const result = await agentService.invoke(input, {
      type: "react",
      maxIterations: 10,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("代理执行错误:", error);

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

