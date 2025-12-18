import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { AgentConfig, ToolDefinition } from "../domain/types";
import { AgentType } from "../domain/models";
import { getLLMLoader } from "../infrastructure/llm-loader";
import { createTools } from "./tools";

/**
 * 代理服务
 * 提供代理功能，支持工具调用
 */
export class AgentService {
  private llmLoader = getLLMLoader();
  private agentExecutor: AgentExecutor | null = null;

  /**
   * 创建 ReAct 代理
   */
  async createReActAgent(tools: ToolDefinition[] = []): Promise<AgentExecutor> {
    const llm = this.llmLoader.getLLM();
    const langchainTools = createTools(tools);

    // 使用 LangChain Hub 的 ReAct 提示词
    let prompt: ChatPromptTemplate;
    try {
      prompt = await pull<ChatPromptTemplate>("hwchase17/react");
    } catch (error) {
      // 如果无法从 Hub 拉取，使用默认提示词
      console.warn("无法从 LangChain Hub 拉取提示词，使用默认提示词:", error);
      prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant. Use tools to answer questions."],
        ["placeholder", "{chat_history}"],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
      ]);
    }

    const agent = await createReactAgent({
      llm,
      tools: langchainTools,
      prompt,
    });

    this.agentExecutor = new AgentExecutor({
      agent,
      tools: langchainTools,
      verbose: true,
      maxIterations: 15,
    });

    return this.agentExecutor;
  }

  /**
   * 执行代理任务
   */
  async invoke(
    input: string,
    config?: Partial<AgentConfig>
  ): Promise<string> {
    let executor = this.agentExecutor;

    // 如果配置了工具，创建新的代理
    if (config?.tools && config.tools.length > 0) {
      const tools = config.tools.map((name) => ({ name, description: "" }));
      executor = await this.createReActAgent(tools);
    } else if (!executor) {
      // 如果没有现有代理，创建默认代理
      executor = await this.createReActAgent();
    }

    // 更新最大迭代次数
    if (config?.maxIterations) {
      executor.maxIterations = config.maxIterations;
    }

    const result = await executor.invoke({ input });
    return result.output as string;
  }

  /**
   * 流式执行代理任务
   */
  async *invokeStream(
    input: string,
    config?: Partial<AgentConfig>
  ): AsyncGenerator<{ content: string; done: boolean }, void, unknown> {
    let executor = this.agentExecutor;

    // 如果配置了工具，创建新的代理
    if (config?.tools && config.tools.length > 0) {
      const tools = config.tools.map((name) => ({ name, description: "" }));
      executor = await this.createReActAgent(tools);
    } else if (!executor) {
      // 如果没有现有代理，创建默认代理
      executor = await this.createReActAgent();
    }

    // 更新最大迭代次数
    if (config?.maxIterations) {
      executor.maxIterations = config.maxIterations;
    }

    try {
      const stream = await executor.stream({ input });

      for await (const chunk of stream) {
        if ("agent" in chunk && "returnValues" in chunk.agent) {
          yield {
            content: chunk.agent.returnValues.output as string,
            done: false,
          };
        } else if ("output" in chunk) {
          yield {
            content: chunk.output as string,
            done: false,
          };
        }
      }

      yield {
        content: "",
        done: true,
      };
    } catch (error) {
      yield {
        content: error instanceof Error ? error.message : String(error),
        done: true,
      };
    }
  }

  /**
   * 重置代理
   */
  reset(): void {
    this.agentExecutor = null;
  }
}

