import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  ArrowRight, 
  Play, 
  FileText, 
  Zap, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export function HeroSection() {
  const [currentExample, setCurrentExample] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const codeExamples = [
    {
      language: 'JavaScript',
      before: `function calculateTotal(items, tax) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal + (subtotal * tax);
}`,
      after: `### calculateTotal

Calculates the total cost including tax for a list of items.

**Parameters:**
- **items** \`Array<Object>\` - Array of items with price property
- **tax** \`number\` - Tax rate as decimal (e.g., 0.08 for 8%)

**Returns:**
- \`number\` - Total cost including tax

**Example:**
\`\`\`javascript
const items = [{ price: 10 }, { price: 20 }];
const total = calculateTotal(items, 0.08);
console.log(total); // 32.4
\`\`\``
    },
    {
      language: 'Python',
      before: `def fetch_user_data(user_id, include_posts=False):
    user = db.get_user(user_id)
    if include_posts:
        user.posts = db.get_user_posts(user_id)
    return user`,
      after: `### fetch_user_data

Retrieves user data from the database with optional post inclusion.

**Parameters:**
- **user_id** \`int\` - Unique identifier for the user
- **include_posts** \`bool\` - Whether to include user's posts (default: False)

**Returns:**
- \`User\` - User object with optional posts data

**Example:**
\`\`\`python
user = fetch_user_data(123, include_posts=True)
print(f"User: {user.name}, Posts: {len(user.posts)}")
\`\`\``
    },
    {
      language: 'TypeScript',
      before: `interface ApiResponse<T> {
  data: T;
  status: number;
}

async function apiCall<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint);
  return { data: await response.json(), status: response.status };
}`,
      after: `### ApiResponse<T>

Generic interface for API response structure.

**Properties:**
- **data** \`T\` - The response payload of generic type T
- **status** \`number\` - HTTP status code of the response

### apiCall<T>

Makes an HTTP request to the specified endpoint and returns structured response.

**Parameters:**
- **endpoint** \`string\` - The API endpoint URL to call

**Returns:**
- \`Promise<ApiResponse<T>>\` - Promise resolving to structured API response

**Example:**
\`\`\`typescript
const response = await apiCall<User[]>('/api/users');
console.log(\`Status: \${response.status}, Users: \${response.data.length}\`);
\`\`\``
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % codeExamples.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleDemo = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText('npm install -g auto-docs-cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Badge className="mb-4" variant="outline">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Documentation
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Documentation
                <br />
                that{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  doesn't suck
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
            >
              Stop writing docs manually. Let AI analyze your code and generate beautiful, 
              comprehensive documentation in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Link href="/demo">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleDemo}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Zap className="h-5 w-5" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Try Live Demo
                    </>
                  )}
                </Button>
              </Link>

              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                asChild
              >
                <a href="https://github.com/auto-docs/auto-docs" target="_blank" rel="noopener noreferrer">
                  <Code className="mr-2 h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </motion.div>

            {/* Installation Command */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto lg:mx-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm ml-2">terminal</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="mt-2 font-mono text-sm">
                <span className="text-green-400">$</span>
                <span className="text-white ml-2">npm install -g auto-docs-cli</span>
              </div>
            </motion.div>

          </motion.div>

          {/* Right Column - Code Example */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Window Controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-xs">
                    {codeExamples[currentExample].language}
                  </Badge>
                  <motion.div
                    key={currentExample}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                  </motion.div>
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExample}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Before */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Before: Undocumented Code
                        </span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="text-gray-800 dark:text-gray-200">
                          {codeExamples[currentExample].before}
                        </pre>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      >
                        <ArrowRight className="h-5 w-5 text-white transform rotate-90" />
                      </motion.div>
                    </div>

                    {/* After */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          After: AI-Generated Documentation
                        </span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                            {codeExamples[currentExample].after}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Example Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {codeExamples.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentExample(index)}
                      aria-label={`Show example ${index + 1}`}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentExample 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 shadow-lg"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-3 shadow-lg"
            >
              <FileText className="h-6 w-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
