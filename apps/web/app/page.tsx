import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

const FeatureCard = ({
  title,
  description,
  href,
  icon,
  gradient,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
}) => {
  return (
    <Link href={href}>
      <Card className="group h-full transition-all duration-300 hover:shadow-dribbble-lg hover:-translate-y-1 cursor-pointer border-0 shadow-dribbble-md">
        <div className={`h-2 ${gradient} rounded-t-lg`} />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{icon}</span>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <ThemeImage
            className="logo"
            srcLight="turborepo-dark.svg"
            srcDark="turborepo-light.svg"
            alt="Turborepo logo"
            width={180}
            height={38}
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-gradient">AI 集成平台</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            探索强大的 AI 功能：TensorFlow.js、LangChain、推荐系统和图像识别
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            title="TensorFlow.js"
            description="在浏览器中运行机器学习模型，包括图像分类、对象检测和姿态估计"
            href="/tensorflow-demo"
            icon="🚀"
            gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <FeatureCard
            title="LangChain"
            description="强大的 AI 聊天、文档处理、RAG 检索和智能代理功能"
            href="/langchain-demo"
            icon="🤖"
            gradient="bg-gradient-to-r from-purple-500 to-pink-500"
          />
          <FeatureCard
            title="推荐系统"
            description="基于用户行为的智能推荐引擎，提供个性化内容推荐"
            href="/recommendation-demo"
            icon="💡"
            gradient="bg-gradient-to-r from-orange-500 to-red-500"
          />
          <FeatureCard
            title="图像识别"
            description="先进的图像识别和处理技术，支持多种识别场景"
            href="/image-recognition"
            icon="🖼️"
            gradient="bg-gradient-to-r from-green-500 to-emerald-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button asChild size="lg" className="rounded-full px-8 shadow-dribbble-md hover:shadow-dribbble-lg transition-all">
            <Link
              href="https://vercel.com/new/clone?demo-description=Learn+to+implement+a+monorepo+with+a+two+Next.js+sites+that+has+installed+three+local+packages.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4K8ZISWAzJ8X1504ca0zmC%2F0b21a1c6246add355e55816278ef54bc%2FBasic.png&demo-title=Monorepo+with+Turborepo&demo-url=https%3A%2F%2Fexamples-basic-web.vercel.sh%2F&from=templates&project-name=Monorepo+with+Turborepo&repository-name=monorepo-turborepo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fturborepo%2Ftree%2Fmain%2Fexamples%2Fbasic&root-directory=apps%2Fdocs&skippable-integrations=1&teamSlug=vercel&utm_source=create-turbo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
                className="mr-2"
              />
              立即部署
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link
              href="https://turborepo.com/docs?utm_source"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看文档
            </Link>
          </Button>
        </div>

        {/* Info Section */}
        <Card className="max-w-4xl mx-auto shadow-dribbble-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">提示</Badge>
              快速开始
            </CardTitle>
            <CardDescription>
              开始编辑 <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">apps/web/app/page.tsx</code> 来查看实时更改
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground font-mono text-sm">
              <li>开始编辑 <code className="bg-muted px-1.5 py-0.5 rounded">apps/web/app/page.tsx</code></li>
              <li>保存文件后立即查看更改</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-16 border-t">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link
            href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            示例
          </Link>
          <Link
            href="https://turborepo.com?utm_source=create-turbo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            前往 turborepo.com →
          </Link>
        </div>
      </footer>
    </div>
  );
}
