"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";

type ActiveTab =
  | "chat"
  | "documents"
  | "rag"
  | "chains"
  | "agents"
  | "memory"
  | "tools";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function LangChainDemoPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LLM 配置状态
  const [provider, setProvider] = useState<"ollama" | "deepseek">("ollama");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("llama3");
  const [showConfig, setShowConfig] = useState(false);

  // 聊天状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  // 文档处理状态
  const [documentText, setDocumentText] = useState("");
  const [documentResult, setDocumentResult] = useState("");

  // RAG 状态
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragSources, setRagSources] = useState<any[]>([]);
  const [ragDocumentText, setRagDocumentText] = useState("");

  // 链状态
  const [chainInput, setChainInput] = useState("");
  const [chainResult, setChainResult] = useState("");

  // 代理状态
  const [agentInput, setAgentInput] = useState("");
  const [agentResult, setAgentResult] = useState("");

  // 记忆状态
  const [memoryInput, setMemoryInput] = useState("");
  const [memoryHistory, setMemoryHistory] = useState<ChatMessage[]>([]);

  // 工具状态
  const [toolInput, setToolInput] = useState("");
  const [toolResult, setToolResult] = useState("");

  const updateLLMConfig = async () => {
    try {
      const response = await fetch("/api/llm/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model: provider === "deepseek" ? (model || "deepseek-chat") : model,
          apiKey: provider === "deepseek" ? apiKey : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowConfig(false);
        setError(null);
      } else {
        setError(data.error || "配置更新失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "配置更新失败");
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    setIsProcessing(true);
    setError(null);

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          systemPrompt: systemPrompt || undefined,
          provider,
          apiKey: provider === "deepseek" ? apiKey : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.data,
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
        setChatResponse(data.data);
      } else {
        throw new Error(data.error || "聊天失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "聊天失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentProcess = async () => {
    if (!documentText.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText }),
      });

      const data = await response.json();

      if (data.success) {
        setDocumentResult(data.data);
      } else {
        throw new Error(data.error || "文档处理失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "文档处理失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRAGQuery = async () => {
    if (!ragQuestion.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 如果有文档文本，先添加到 RAG
      if (ragDocumentText.trim()) {
        await fetch("/api/rag/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: ragDocumentText }),
        });
      }

      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: ragQuestion }),
      });

      const data = await response.json();

      if (data.success) {
        setRagAnswer(data.data.answer);
        setRagSources(data.data.sources || []);
      } else {
        throw new Error(data.error || "RAG 查询失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "RAG 查询失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChainExecute = async () => {
    if (!chainInput.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: chainInput }),
      });

      const data = await response.json();

      if (data.success) {
        setChainResult(data.data);
      } else {
        throw new Error(data.error || "链执行失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "链执行失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAgentInvoke = async () => {
    if (!agentInput.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: agentInput }),
      });

      const data = await response.json();

      if (data.success) {
        setAgentResult(data.data);
      } else {
        throw new Error(data.error || "代理执行失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "代理执行失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMemoryChat = async () => {
    if (!memoryInput.trim()) return;

    setIsProcessing(true);
    setError(null);

    const userMessage: ChatMessage = { role: "user", content: memoryInput };
    setMemoryHistory((prev) => [...prev, userMessage]);
    setMemoryInput("");

    try {
      const response = await fetch("/api/memory/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: memoryHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.data,
        };
        setMemoryHistory((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "记忆聊天失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "记忆聊天失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToolExecute = async () => {
    if (!toolInput.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: toolInput }),
      });

      const data = await response.json();

      if (data.success) {
        setToolResult(data.data);
      } else {
        throw new Error(data.error || "工具执行失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "工具执行失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setChatResponse("");
  };

  const clearMemory = () => {
    setMemoryHistory([]);
    fetch("/api/memory/clear", { method: "POST" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>LangChain 功能演示</h1>
        <p className={styles.description}>
          体验 LangChain 的所有核心功能：聊天、文档处理、RAG、链、代理、记忆和工具
        </p>
        <button
          className={styles.buttonOutline}
          onClick={() => setShowConfig(!showConfig)}
          style={{ marginTop: "1rem" }}
        >
          {showConfig ? "隐藏" : "显示"} LLM 配置
        </button>
        {showConfig && (
          <div className={styles.card} style={{ marginTop: "1rem" }}>
            <h3 className={styles.cardTitle}>LLM 配置</h3>
            <div className={styles.configGroup}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>提供商</label>
                <select
                  className={styles.input}
                  value={provider}
                  onChange={(e) =>
                    setProvider(e.target.value as "ollama" | "deepseek")
                  }
                >
                  <option value="ollama">Ollama (本地)</option>
                  <option value="deepseek">DeepSeek (API)</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>模型</label>
                <input
                  className={styles.input}
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={
                    provider === "deepseek"
                      ? "deepseek-chat"
                      : "llama3"
                  }
                />
              </div>
              {provider === "deepseek" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>API Key</label>
                  <input
                    className={styles.input}
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入 DeepSeek API Key"
                  />
                </div>
              )}
            </div>
            <button
              className={styles.button}
              onClick={updateLLMConfig}
              disabled={provider === "deepseek" && !apiKey.trim()}
            >
              更新配置
            </button>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "chat" ? styles.active : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          💬 聊天
        </button>
        <button
          className={`${styles.tab} ${activeTab === "documents" ? styles.active : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          📄 文档处理
        </button>
        <button
          className={`${styles.tab} ${activeTab === "rag" ? styles.active : ""}`}
          onClick={() => setActiveTab("rag")}
        >
          🔍 RAG 检索
        </button>
        <button
          className={`${styles.tab} ${activeTab === "chains" ? styles.active : ""}`}
          onClick={() => setActiveTab("chains")}
        >
          ⛓️ 链
        </button>
        <button
          className={`${styles.tab} ${activeTab === "agents" ? styles.active : ""}`}
          onClick={() => setActiveTab("agents")}
        >
          🤖 代理
        </button>
        <button
          className={`${styles.tab} ${activeTab === "memory" ? styles.active : ""}`}
          onClick={() => setActiveTab("memory")}
        >
          🧠 记忆
        </button>
        <button
          className={`${styles.tab} ${activeTab === "tools" ? styles.active : ""}`}
          onClick={() => setActiveTab("tools")}
        >
          🛠️ 工具
        </button>
      </div>

      <div className={styles.tabContent}>
        {error && (
          <div className={styles.errorCard}>
            <p className={styles.errorMessage}>❌ {error}</p>
          </div>
        )}

        {/* 聊天标签页 */}
        {activeTab === "chat" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>基础聊天</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>系统提示词（可选）</label>
              <textarea
                className={styles.textArea}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="例如：你是一个有用的AI助手..."
                rows={2}
              />
            </div>
            <div className={styles.chatContainer}>
              {chatMessages.length === 0 && (
                <p style={{ color: "#666", textAlign: "center" }}>
                  开始对话...
                </p>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.chatMessage} ${styles[msg.role]}`}
                >
                  {msg.content}
                </div>
              ))}
              {isProcessing && (
                <div className={styles.chatMessage}>
                  <div className={styles.loading}></div>
                </div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input
                className={styles.input}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleChat()}
                placeholder="输入消息..."
                disabled={isProcessing}
              />
              <button
                className={styles.button}
                onClick={handleChat}
                disabled={isProcessing || !chatInput.trim()}
              >
                发送
              </button>
              <button
                className={styles.buttonOutline}
                onClick={clearChat}
                disabled={isProcessing}
              >
                清空
              </button>
            </div>
          </div>
        )}

        {/* 文档处理标签页 */}
        {activeTab === "documents" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>文档加载与处理</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>文档文本</label>
              <textarea
                className={styles.textArea}
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="输入或粘贴文档内容..."
                rows={10}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleDocumentProcess}
                disabled={isProcessing || !documentText.trim()}
              >
                处理文档
              </button>
            </div>
            {documentResult && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>处理结果</h3>
                <div className={styles.resultContent}>{documentResult}</div>
              </div>
            )}
          </div>
        )}

        {/* RAG 标签页 */}
        {activeTab === "rag" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>RAG 检索增强生成</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>添加文档（用于检索）</label>
              <textarea
                className={styles.textArea}
                value={ragDocumentText}
                onChange={(e) => setRagDocumentText(e.target.value)}
                placeholder="输入文档内容，这些内容将被索引用于检索..."
                rows={6}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>问题</label>
              <textarea
                className={styles.textArea}
                value={ragQuestion}
                onChange={(e) => setRagQuestion(e.target.value)}
                placeholder="输入你的问题..."
                rows={3}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleRAGQuery}
                disabled={isProcessing || !ragQuestion.trim()}
              >
                查询
              </button>
            </div>
            {ragAnswer && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>回答</h3>
                <div className={styles.resultContent}>{ragAnswer}</div>
                {ragSources.length > 0 && (
                  <div className={styles.sourcesList}>
                    <h4>相关来源：</h4>
                    {ragSources.map((source, idx) => (
                      <div key={idx} className={styles.sourceItem}>
                        <div>{source.pageContent}</div>
                        {source.score && (
                          <div className={styles.sourceScore}>
                            相似度: {(source.score * 100).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 链标签页 */}
        {activeTab === "chains" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>链式处理</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>输入</label>
              <textarea
                className={styles.textArea}
                value={chainInput}
                onChange={(e) => setChainInput(e.target.value)}
                placeholder="输入要处理的内容..."
                rows={5}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleChainExecute}
                disabled={isProcessing || !chainInput.trim()}
              >
                执行链
              </button>
            </div>
            {chainResult && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>结果</h3>
                <div className={styles.resultContent}>{chainResult}</div>
              </div>
            )}
          </div>
        )}

        {/* 代理标签页 */}
        {activeTab === "agents" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>代理（Agents）</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>任务描述</label>
              <textarea
                className={styles.textArea}
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                placeholder="描述代理需要完成的任务，例如：计算 123 * 456..."
                rows={5}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleAgentInvoke}
                disabled={isProcessing || !agentInput.trim()}
              >
                执行代理
              </button>
            </div>
            {agentResult && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>执行结果</h3>
                <div className={styles.resultContent}>{agentResult}</div>
              </div>
            )}
          </div>
        )}

        {/* 记忆标签页 */}
        {activeTab === "memory" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>对话记忆</h2>
            <div className={styles.chatContainer}>
              {memoryHistory.length === 0 && (
                <p style={{ color: "#666", textAlign: "center" }}>
                  开始对话，记忆将自动保存...
                </p>
              )}
              {memoryHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.chatMessage} ${styles[msg.role]}`}
                >
                  {msg.content}
                </div>
              ))}
              {isProcessing && (
                <div className={styles.chatMessage}>
                  <div className={styles.loading}></div>
                </div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input
                className={styles.input}
                type="text"
                value={memoryInput}
                onChange={(e) => setMemoryInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleMemoryChat()}
                placeholder="输入消息..."
                disabled={isProcessing}
              />
              <button
                className={styles.button}
                onClick={handleMemoryChat}
                disabled={isProcessing || !memoryInput.trim()}
              >
                发送
              </button>
              <button
                className={styles.buttonOutline}
                onClick={clearMemory}
                disabled={isProcessing}
              >
                清空记忆
              </button>
            </div>
          </div>
        )}

        {/* 工具标签页 */}
        {activeTab === "tools" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>工具调用</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>工具输入（例如：计算表达式）</label>
              <textarea
                className={styles.textArea}
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                placeholder="例如：计算 2 + 2 * 3..."
                rows={5}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleToolExecute}
                disabled={isProcessing || !toolInput.trim()}
              >
                执行工具
              </button>
            </div>
            {toolResult && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>执行结果</h3>
                <div className={styles.resultContent}>{toolResult}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

