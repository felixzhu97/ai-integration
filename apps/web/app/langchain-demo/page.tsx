"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import { Skeleton } from "@repo/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function LangChainDemoPage() {
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
  };

  const clearMemory = () => {
    setMemoryHistory([]);
    fetch("/api/memory/clear", { method: "POST" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">LangChain 功能演示</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            体验 LangChain 的所有核心功能：聊天、文档处理、RAG、链、代理、记忆和工具
          </p>
          <Button
            variant="outline"
            onClick={() => setShowConfig(!showConfig)}
            className="mt-4"
          >
            {showConfig ? "隐藏" : "显示"} LLM 配置
          </Button>
          {showConfig && (
            <Card className="mt-4 max-w-2xl mx-auto shadow-dribbble-md">
              <CardHeader>
                <CardTitle>LLM 配置</CardTitle>
                <CardDescription>配置语言模型的提供商和参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>提供商</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={provider}
                      onChange={(e) =>
                        setProvider(e.target.value as "ollama" | "deepseek")
                      }
                    >
                      <option value="ollama">Ollama (本地)</option>
                      <option value="deepseek">DeepSeek (API)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>模型</Label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={
                        provider === "deepseek" ? "deepseek-chat" : "llama3"
                      }
                    />
                  </div>
                  {provider === "deepseek" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="输入 DeepSeek API Key"
                      />
                    </div>
                  )}
                </div>
                <Button
                  onClick={updateLLMConfig}
                  disabled={provider === "deepseek" && !apiKey.trim()}
                  className="w-full"
                >
                  更新配置
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {error && (
          <Card className="mb-6 border-destructive shadow-dribbble-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <span>❌</span>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 h-auto p-1">
            <TabsTrigger value="chat">💬 聊天</TabsTrigger>
            <TabsTrigger value="documents">📄 文档</TabsTrigger>
            <TabsTrigger value="rag">🔍 RAG</TabsTrigger>
            <TabsTrigger value="chains">⛓️ 链</TabsTrigger>
            <TabsTrigger value="agents">🤖 代理</TabsTrigger>
            <TabsTrigger value="memory">🧠 记忆</TabsTrigger>
            <TabsTrigger value="tools">🛠️ 工具</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>基础聊天</CardTitle>
                <CardDescription>与 AI 进行对话交流</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>系统提示词（可选）</Label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="例如：你是一个有用的AI助手..."
                    rows={2}
                  />
                </div>
                <div className="rounded-lg border bg-card p-4 h-[400px] overflow-y-auto space-y-4">
                  {chatMessages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      开始对话...
                    </p>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <Skeleton className="h-10 w-32" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleChat()}
                    placeholder="输入消息..."
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleChat}
                    disabled={isProcessing || !chatInput.trim()}
                  >
                    发送
                  </Button>
                  <Button variant="outline" onClick={clearChat} disabled={isProcessing}>
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>文档加载与处理</CardTitle>
                <CardDescription>处理和解析文档内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>文档文本</Label>
                  <Textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="输入或粘贴文档内容..."
                    rows={10}
                  />
                </div>
                <Button
                  onClick={handleDocumentProcess}
                  disabled={isProcessing || !documentText.trim()}
                >
                  处理文档
                </Button>
                {documentResult && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>处理结果</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{documentResult}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAG Tab */}
          <TabsContent value="rag" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>RAG 检索增强生成</CardTitle>
                <CardDescription>基于文档内容进行智能问答</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>添加文档（用于检索）</Label>
                  <Textarea
                    value={ragDocumentText}
                    onChange={(e) => setRagDocumentText(e.target.value)}
                    placeholder="输入文档内容，这些内容将被索引用于检索..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>问题</Label>
                  <Textarea
                    value={ragQuestion}
                    onChange={(e) => setRagQuestion(e.target.value)}
                    placeholder="输入你的问题..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleRAGQuery}
                  disabled={isProcessing || !ragQuestion.trim()}
                >
                  查询
                </Button>
                {ragAnswer && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>回答</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="whitespace-pre-wrap">{ragAnswer}</p>
                      {ragSources.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="font-semibold">相关来源：</h4>
                            {ragSources.map((source, idx) => (
                              <Card key={idx} className="bg-background">
                                <CardContent className="pt-4">
                                  <p className="text-sm">{source.pageContent}</p>
                                  {source.score && (
                                    <Badge variant="secondary" className="mt-2">
                                      相似度: {(source.score * 100).toFixed(2)}%
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chains Tab */}
          <TabsContent value="chains" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>链式处理</CardTitle>
                <CardDescription>通过链式调用处理复杂任务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>输入</Label>
                  <Textarea
                    value={chainInput}
                    onChange={(e) => setChainInput(e.target.value)}
                    placeholder="输入要处理的内容..."
                    rows={5}
                  />
                </div>
                <Button
                  onClick={handleChainExecute}
                  disabled={isProcessing || !chainInput.trim()}
                >
                  执行链
                </Button>
                {chainResult && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>结果</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{chainResult}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>代理（Agents）</CardTitle>
                <CardDescription>使用智能代理完成复杂任务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>任务描述</Label>
                  <Textarea
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="描述代理需要完成的任务，例如：计算 123 * 456..."
                    rows={5}
                  />
                </div>
                <Button
                  onClick={handleAgentInvoke}
                  disabled={isProcessing || !agentInput.trim()}
                >
                  执行代理
                </Button>
                {agentResult && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>执行结果</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{agentResult}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>对话记忆</CardTitle>
                <CardDescription>带有记忆功能的对话系统</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-card p-4 h-[400px] overflow-y-auto space-y-4">
                  {memoryHistory.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      开始对话，记忆将自动保存...
                    </p>
                  )}
                  {memoryHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <Skeleton className="h-10 w-32" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={memoryInput}
                    onChange={(e) => setMemoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleMemoryChat()}
                    placeholder="输入消息..."
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleMemoryChat}
                    disabled={isProcessing || !memoryInput.trim()}
                  >
                    发送
                  </Button>
                  <Button variant="outline" onClick={clearMemory} disabled={isProcessing}>
                    清空记忆
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <Card className="shadow-dribbble-md">
              <CardHeader>
                <CardTitle>工具调用</CardTitle>
                <CardDescription>使用工具扩展 AI 能力</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>工具输入（例如：计算表达式）</Label>
                  <Textarea
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    placeholder="例如：计算 2 + 2 * 3..."
                    rows={5}
                  />
                </div>
                <Button
                  onClick={handleToolExecute}
                  disabled={isProcessing || !toolInput.trim()}
                >
                  执行工具
                </Button>
                {toolResult && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>执行结果</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{toolResult}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
