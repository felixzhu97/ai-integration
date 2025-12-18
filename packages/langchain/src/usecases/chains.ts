import { LLMChain } from "langchain/chains";
import { SequentialChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import type { ChainConfig } from "../domain/types";
import { ChainType } from "../domain/models";
import { getLLMLoader } from "../infrastructure/llm-loader";

/**
 * 链服务
 * 提供各种链式处理功能
 */
export class ChainService {
  private llmLoader = getLLMLoader();

  /**
   * 创建 LLM 链
   */
  createLLMChain(prompt: string, outputKey: string = "text"): LLMChain {
    const llm = this.llmLoader.getLLM();
    const promptTemplate = PromptTemplate.fromTemplate(prompt);

    return new LLMChain({
      llm,
      prompt: promptTemplate,
      outputKey,
    });
  }

  /**
   * 执行 LLM 链
   */
  async runLLMChain(
    prompt: string,
    input: Record<string, string>,
    outputKey: string = "text"
  ): Promise<string> {
    const chain = this.createLLMChain(prompt, outputKey);
    const result = await chain.invoke(input);
    return result[outputKey] as string;
  }

  /**
   * 创建顺序链
   */
  createSequentialChain(chains: LLMChain[]): SequentialChain {
    return new SequentialChain({
      chains,
      verbose: true,
    });
  }

  /**
   * 执行顺序链
   */
  async runSequentialChain(
    chainConfigs: Array<{ prompt: string; inputKey: string; outputKey: string }>,
    initialInput: Record<string, string>
  ): Promise<Record<string, string>> {
    const chains: LLMChain[] = [];

    // 创建所有链
    for (const config of chainConfigs) {
      const chain = this.createLLMChain(config.prompt, config.outputKey);
      chains.push(chain);
    }

    // 创建顺序链
    const sequentialChain = this.createSequentialChain(chains);

    // 执行
    const result = await sequentialChain.invoke(initialInput);
    return result as Record<string, string>;
  }

  /**
   * 创建自定义链
   */
  createCustomChain(config: ChainConfig): LLMChain | SequentialChain {
    switch (config.type) {
      case ChainType.LLM:
        if (!config.prompt) {
          throw new Error("LLM 链需要提供 prompt");
        }
        return this.createLLMChain(
          config.prompt,
          config.outputKey || "text"
        );

      case ChainType.SEQUENTIAL:
        throw new Error("顺序链需要通过 runSequentialChain 方法创建");

      default:
        throw new Error(`不支持的链类型: ${config.type}`);
    }
  }
}



