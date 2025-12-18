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
 * POST /api/rag/query
 * RAG 查询
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, k } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "请提供有效的问题" },
        { status: 400 }
      );
    }

    const service = getRAGService();
    const result = await service.query(question, k || 4);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("RAG 查询错误:", error);

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

