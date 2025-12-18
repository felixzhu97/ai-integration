import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { DocumentChunkOptions } from "../domain/types";
import { DocumentLoaderType, DEFAULT_CONFIG } from "../domain/models";
import * as fs from "fs/promises";
import * as path from "path";
import pdfParse from "pdf-parse";

/**
 * 文档加载服务
 * 支持加载和处理 PDF、文本文件等文档
 */
export class DocumentLoaderService {
  /**
   * 从文件加载文档
   */
  async loadFromFile(
    filePath: string,
    type?: DocumentLoaderType
  ): Promise<Document[]> {
    const fileType = type || this.detectFileType(filePath);
    const content = await fs.readFile(filePath, "utf-8");

    switch (fileType) {
      case DocumentLoaderType.PDF:
        return await this.loadPDF(filePath);
      case DocumentLoaderType.TEXT:
        return [
          new Document({
            pageContent: content,
            metadata: {
              source: filePath,
              type: "text",
            },
          }),
        ];
      default:
        throw new Error(`不支持的文档类型: ${fileType}`);
    }
  }

  /**
   * 从字符串加载文档
   */
  loadFromString(
    content: string,
    metadata?: Record<string, unknown>
  ): Document[] {
    return [
      new Document({
        pageContent: content,
        metadata: metadata || {},
      }),
    ];
  }

  /**
   * 从 Buffer 加载 PDF 文档
   */
  async loadPDFFromBuffer(
    buffer: Buffer,
    metadata?: Record<string, unknown>
  ): Promise<Document[]> {
    try {
      const data = await pdfParse(buffer);
      return [
        new Document({
          pageContent: data.text,
          metadata: {
            ...metadata,
            pages: data.numpages,
            info: data.info,
            type: "pdf",
          },
        }),
      ];
    } catch (error) {
      throw new Error(`PDF 解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 从文件路径加载 PDF
   */
  private async loadPDF(filePath: string): Promise<Document[]> {
    const buffer = await fs.readFile(filePath);
    return await this.loadPDFFromBuffer(buffer, {
      source: filePath,
    });
  }

  /**
   * 文档分块
   */
  async chunkDocuments(
    documents: Document[],
    options?: DocumentChunkOptions
  ): Promise<Document[]> {
    const chunkSize = options?.chunkSize || DEFAULT_CONFIG.DEFAULT_CHUNK_SIZE;
    const chunkOverlap =
      options?.chunkOverlap || DEFAULT_CONFIG.DEFAULT_CHUNK_OVERLAP;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const chunks: Document[] = [];

    for (const doc of documents) {
      const splitDocs = await splitter.splitDocuments([doc]);
      chunks.push(...splitDocs);
    }

    return chunks;
  }

  /**
   * 检测文件类型
   */
  private detectFileType(filePath: string): DocumentLoaderType {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".pdf":
        return DocumentLoaderType.PDF;
      case ".txt":
      case ".md":
      case ".json":
        return DocumentLoaderType.TEXT;
      default:
        return DocumentLoaderType.TEXT;
    }
  }
}

