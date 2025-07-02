import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemoPlayground } from '@/components/demo-playground';
import { Code, ArrowLeft, Sparkles, Zap, FileText, Download } from 'lucide-react';

export default function Demo() {
  const [isGenerating, setIsGenerating] = useState(false);

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "AI-Powered Analysis",
      description: "Uses GPT-4o to understand code context and generate meaningful documentation"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Instant Generation",
      description: "Get professional documentation in seconds, not hours"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Multiple Formats",
      description: "Output as Markdown, HTML, or JSON for any use case"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Export Ready",
      description: "Copy, download, or integrate generated docs into your workflow"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Auto-Docs Demo
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Live Demo
              </Badge>
              <Button asChild>
                <a href="https://github.com/auto-docs/auto-docs" target="_blank" rel="noopener noreferrer">
                  Get Started
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Badge className="mb-4" variant="outline">
                <Sparkles className="h-3 w-3 mr-1" />
                Interactive Demo
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                See Auto-Docs in{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Action
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the power of AI-generated documentation. Paste your code, choose your language, 
                and watch as Auto-Docs transforms it into professional documentation in seconds.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Demo Playground */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DemoPlayground />
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                How Auto-Docs Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our AI-powered engine analyzes your code structure, understands context, 
                and generates human-readable documentation that actually helps developers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Code Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our parser analyzes your code structure, extracting functions, classes, 
                  parameters, and existing comments to understand the context.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  AI Generation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  GPT-4o processes the code context and generates comprehensive documentation 
                  with descriptions, parameters, return values, and examples.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Format & Export
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The generated documentation is formatted for your chosen output 
                  (Markdown, HTML, or JSON) and ready for integration into your workflow.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Install Auto-Docs and start generating beautiful documentation in minutes
              </p>
            </div>

            <Tabs defaultValue="cli" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cli">CLI Tool</TabsTrigger>
                <TabsTrigger value="vscode">VS Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cli" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Command Line Interface
                    </CardTitle>
                    <CardDescription>
                      Install globally and use from any project directory
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
                      <div className="text-green-400"># Install globally</div>
                      <div>npm install -g auto-docs-cli</div>
                      <div className="mt-4 text-green-400"># Generate documentation</div>
                      <div>auto-docs generate ./src</div>
                      <div className="mt-2 text-green-400"># Watch for changes</div>
                      <div>auto-docs watch ./src --output ./docs</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="vscode" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      VS Code Extension
                    </CardTitle>
                    <CardDescription>
                      Generate docs directly from your editor with right-click context menu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      Coming Soon
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Love What You See?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of developers who have already transformed their documentation workflow
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="https://github.com/auto-docs/auto-docs" target="_blank" rel="noopener noreferrer">
                  ⭐ Star on GitHub
                </a>
              </Button>
            </div>

            <p className="text-blue-100 mt-8 text-sm">
              No credit card required • Open source • MIT License
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
