import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@repo/langchain";

// 使用单例模式，保持向量存储状态
let ragService: RAGService | null = null;

function getRAGService(): RAGService {
  if (!ragService) {
    ragService = new RAGService({
      type: "memory",
    });
  }
  return ragService;
}

/**
 * POST /api/rag/add
 * 添加文档到 RAG 向量存储
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "请提供有效的文档文本" },
        { status: 400 }
      );
    }

    const service = getRAGService();
    await service.loadAndIndexText(text, {
      source: "api",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "文档已添加到向量存储",
    });
  } catch (error) {
    console.error("RAG 添加文档错误:", error);

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



