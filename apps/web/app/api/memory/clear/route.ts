import { NextRequest, NextResponse } from "next/server";

// 全局记忆服务引用（需要与 chat 路由共享）
// 注意：在实际应用中，应该使用更好的状态管理方式
let memoryServiceRef: any = null;

export function setMemoryServiceRef(service: any) {
  memoryServiceRef = service;
}

/**
 * POST /api/memory/clear
 * 清空记忆
 */
export async function POST(request: NextRequest) {
  try {
    if (memoryServiceRef) {
      await memoryServiceRef.clear();
    }

    return NextResponse.json({
      success: true,
      message: "记忆已清空",
    });
  } catch (error) {
    console.error("清空记忆错误:", error);

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
