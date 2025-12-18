import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../domain/types";

/**
 * 创建工具列表
 */
export function createTools(definitions: ToolDefinition[] = []) {
  const tools = [];

  // 计算器工具
  const calculatorTool = new DynamicStructuredTool({
    name: "calculator",
    description: "执行数学计算。输入一个数学表达式，返回计算结果。",
    schema: z.object({
      expression: z.string().describe("要计算的数学表达式，例如：2 + 2, 10 * 5, sqrt(16)"),
    }),
    func: async ({ expression }) => {
      try {
        // 安全的数学表达式计算
        // 只允许基本的数学运算
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
        const result = Function(`"use strict"; return (${sanitized})`)();
        return String(result);
      } catch (error) {
        return `计算错误: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });

  tools.push(calculatorTool);

  // 根据定义创建自定义工具
  for (const def of definitions) {
    if (def.name === "calculator") {
      continue; // 跳过已添加的计算器
    }

    const customTool = new DynamicStructuredTool({
      name: def.name,
      description: def.description,
      schema: def.schema ? (z.object(def.schema as Record<string, z.ZodTypeAny>)) : z.object({
        input: z.string().describe("工具输入"),
      }),
      func: async (input: unknown) => {
        // 自定义工具需要用户实现
        return `工具 ${def.name} 执行结果: ${JSON.stringify(input)}`;
      },
    });

    tools.push(customTool);
  }

  return tools;
}

/**
 * 工具服务
 * 提供工具定义和执行功能
 */
export class ToolService {
  /**
   * 执行工具
   */
  async executeTool(
    toolName: string,
    input: unknown,
    tools: ToolDefinition[] = []
  ): Promise<ToolResult> {
    const toolList = createTools(tools);
    const tool = toolList.find((t) => t.name === toolName);

    if (!tool) {
      return {
        tool: toolName,
        result: null,
        error: `工具 ${toolName} 未找到`,
      };
    }

    try {
      const result = await tool.invoke(input);
      return {
        tool: toolName,
        result,
      };
    } catch (error) {
      return {
        tool: toolName,
        result: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 获取可用工具列表
   */
  getAvailableTools(definitions: ToolDefinition[] = []): ToolDefinition[] {
    const defaultTools: ToolDefinition[] = [
      {
        name: "calculator",
        description: "执行数学计算",
        schema: {
          expression: {
            type: "string",
            description: "要计算的数学表达式",
          },
        },
      },
    ];

    return [...defaultTools, ...definitions];
  }
}

