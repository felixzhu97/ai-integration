import { NextRequest, NextResponse } from "next/server";
import { DocumentLoaderService } from "@repo/langchain";

const documentLoader = new DocumentLoaderService();

/**
 * POST /api/documents
 * 处理文档
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

    // 加载文档
    const documents = documentLoader.loadFromString(text, {
      source: "api",
      timestamp: new Date().toISOString(),
    });

    // 分块
    const chunks = await documentLoader.chunkDocuments(documents);

    return NextResponse.json({
      success: true,
      data: `文档已处理，共 ${documents.length} 个文档，分为 ${chunks.length} 个块。\n\n第一个块的内容：\n${chunks[0]?.pageContent || ""}`,
      metadata: {
        documentCount: documents.length,
        chunkCount: chunks.length,
      },
    });
  } catch (error) {
    console.error("文档处理错误:", error);

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



