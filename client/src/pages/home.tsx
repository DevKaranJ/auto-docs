import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroSection } from '@/components/hero-section';
import { Code, Zap, FileText, Eye, Download, Star, ArrowRight, CheckCircle, Users, Sparkles } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Intelligence",
      description: "GPT-4o analyzes your code context to generate meaningful, accurate documentation that actually helps developers.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Process entire codebases in seconds. No more waiting around - get your documentation generated faster than you can say 'README'.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Multi-Language Support",
      description: "JavaScript, TypeScript, Python, and Go support out of the box. More languages coming soon based on community requests.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Multiple Output Formats",
      description: "Generate beautiful Markdown for GitHub, professional HTML for hosting, or structured JSON for custom integrations.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Live Watch Mode",
      description: "Documentation that stays in sync with your code. Watch mode automatically regenerates docs as you develop.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "VS Code Integration (Coming Soon)",
      description: "Generate documentation directly from your editor. Right-click any file and get instant AI-powered docs.",
      color: "from-red-500 to-pink-500"
    }
  ];

const stats = [
{ number: "99.99%", label: "Uptime Guarantee" },
{ number: "1M+", label: "Requests Handled" },
{ number: "500ms", label: "Average Response Time" },
{ number: "24/7", label: "Support Availability" }
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Auto-Docs
              </span>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" asChild>
                  <a 
                    href="https://github.com/auto-docs/auto-docs" 
                    className="flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Star on GitHub</span>
                  </a>
                </Button>
              </motion.div>
              <Link href="/demo">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Why Developers Love Auto-Docs
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Stop writing documentation manually. Let AI do the heavy lifting while you focus on what matters - building amazing software.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                From Code to Docs in Seconds
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Watch Auto-Docs transform your undocumented functions into comprehensive, professional documentation that your team will actually use.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Understands your code context and purpose</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Generates meaningful parameter descriptions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Includes practical usage examples</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Maintains consistent documentation style</span>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/demo">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    Try Live Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-4 text-sm text-gray-400">terminal</span>
                </div>
                
                <div className="font-mono text-sm">
                  <div className="text-green-400">$ npx auto-docs generate ./src</div>
                  <div className="text-gray-400 mt-2">🚀 Starting documentation generation...</div>
                  <div className="text-gray-400">📁 Scanning files...</div>
                  <div className="text-gray-400">Found 23 files to process</div>
                  <div className="text-blue-400 mt-2">[1/23] Processing utils.js</div>
                  <div className="text-blue-400">[2/23] Processing api.js</div>
                  <div className="text-blue-400">[3/23] Processing components.jsx</div>
                  <div className="text-gray-400">...</div>
                  <div className="text-green-400 mt-2">✨ Documentation generated successfully in ./docs/</div>
                  <div className="text-green-400">📊 Processed 23 files, 127 functions, 15 classes</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Transform Your Documentation?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-8"
          >
            Join thousands of developers who have already saved hundreds of hours with Auto-Docs
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/demo">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Try Live Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 text-blue-100">
              <Users className="h-5 w-5" />
              <span>Developers already using Auto-Docs</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-blue-100"
          >
            <p className="text-sm">
              No credit card required • Open source • MIT License
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Auto-Docs</span>
              </div>
              <p className="text-gray-400">
                AI-powered documentation that doesn't suck. Built by developers, for developers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                <li><a href="https://docs.auto-docs.dev" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/auto-docs/auto-docs" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://marketplace.visualstudio.com/items?itemName=auto-docs.vscode-extension" className="hover:text-white transition-colors">VS Code Extension (Under Development) </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://github.com/auto-docs/auto-docs/discussions" className="hover:text-white transition-colors">Discussions</a></li>
                <li><a href="https://twitter.com/autodocs_dev" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="mailto:support@auto-docs.dev" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 Auto-Docs. Made with ❤️ by developers, for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
