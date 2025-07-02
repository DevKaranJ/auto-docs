import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Code2,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DemoResult {
  markdown: string;
  html: string;
  json: string;
  processingTime: number;
  stats: {
    functionsCount: number;
    classesCount: number;
    exportsCount: number;
  };
}

const codeExamples = {
  javascript: {
    name: 'JavaScript',
    example: `// User authentication utility functions
function validateEmail(email) {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

function hashPassword(password, salt) {
  // Simple hash implementation for demo
  const crypto = require('crypto');
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

class UserManager {
  constructor(database) {
    this.db = database;
    this.cache = new Map();
  }

  async createUser(email, password) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    const salt = crypto.randomBytes(32).toString('hex');
    const hashedPassword = this.hashPassword(password, salt);
    
    const user = await this.db.users.create({
      email,
      password: hashedPassword,
      salt,
      createdAt: new Date()
    });
    
    this.cache.set(user.id, user);
    return user;
  }

  async getUser(userId) {
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }
    
    const user = await this.db.users.findById(userId);
    if (user) {
      this.cache.set(userId, user);
    }
    
    return user;
  }
}`
  },
  typescript: {
    name: 'TypeScript',
    example: `// Type-safe API client with error handling
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      return {
        data,
        status: response.status,
        message: response.statusText
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(\`API request failed: \${error.message}\`);
    }
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(\`/users/\${userId}\`);
  }
}`
  },
  python: {
    name: 'Python',
    example: `"""
Data processing utilities for machine learning pipelines
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

@dataclass
class ProcessingConfig:
    """Configuration for data processing pipeline"""
    normalize: bool = True
    remove_outliers: bool = True
    outlier_threshold: float = 3.0
    fill_missing: str = 'mean'  # 'mean', 'median', 'drop'

class DataProcessor:
    """
    Handles data preprocessing for machine learning models
    """
    
    def __init__(self, config: ProcessingConfig):
        self.config = config
        self.scaler = None
        self.feature_stats = {}
    
    def detect_outliers(self, data: np.ndarray, threshold: float = 3.0) -> np.ndarray:
        """
        Detect outliers using Z-score method
        """
        z_scores = np.abs((data - np.mean(data)) / np.std(data))
        return z_scores > threshold
    
    def handle_missing_values(self, df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
        """
        Handle missing values in the dataset
        """
        if strategy == 'mean':
            return df.fillna(df.mean())
        elif strategy == 'median':
            return df.fillna(df.median())
        elif strategy == 'drop':
            return df.dropna()
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
    
    def process_features(self, 
                        X: pd.DataFrame, 
                        y: Optional[pd.Series] = None) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """
        Main processing pipeline for features
        """
        # Handle missing values
        X_processed = self.handle_missing_values(X, self.config.fill_missing)
        
        # Remove outliers if configured
        if self.config.remove_outliers and y is not None:
            outlier_mask = np.zeros(len(X_processed), dtype=bool)
            for column in X_processed.select_dtypes(include=[np.number]).columns:
                column_outliers = self.detect_outliers(
                    X_processed[column].values, 
                    self.config.outlier_threshold
                )
                outlier_mask |= column_outliers
            
            X_processed = X_processed[~outlier_mask]
            y = y[~outlier_mask] if y is not None else None
        
        # Normalize if configured
        if self.config.normalize:
            from sklearn.preprocessing import StandardScaler
            if self.scaler is None:
                self.scaler = StandardScaler()
                X_processed[X_processed.select_dtypes(include=[np.number]).columns] = \\
                    self.scaler.fit_transform(X_processed.select_dtypes(include=[np.number]))
            else:
                X_processed[X_processed.select_dtypes(include=[np.number]).columns] = \\
                    self.scaler.transform(X_processed.select_dtypes(include=[np.number]))
        
        return X_processed, y

def calculate_feature_importance(model, feature_names: List[str]) -> Dict[str, float]:
    """
    Calculate and return feature importance scores
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        return dict(zip(feature_names, importances))
    else:
        raise ValueError("Model does not support feature importance calculation")`
  },
  go: {
    name: 'Go',
    example: `// Package httpserver provides HTTP server utilities and middleware
package httpserver

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

// Config holds server configuration
type Config struct {
    Port         int           \`json:"port"\`
    ReadTimeout  time.Duration \`json:"read_timeout"\`
    WriteTimeout time.Duration \`json:"write_timeout"\`
    IdleTimeout  time.Duration \`json:"idle_timeout"\`
}

// Response represents a standard API response
type Response struct {
    Data    interface{} \`json:"data,omitempty"\`
    Message string      \`json:"message,omitempty"\`
    Error   string      \`json:"error,omitempty"\`
    Status  int         \`json:"status"\`
}

// Server wraps http.Server with additional functionality
type Server struct {
    httpServer *http.Server
    config     Config
    mux        *http.ServeMux
}

// NewServer creates a new server instance with the given configuration
func NewServer(config Config) *Server {
    mux := http.NewServeMux()
    
    server := &http.Server{
        Addr:         fmt.Sprintf(":%d", config.Port),
        Handler:      mux,
        ReadTimeout:  config.ReadTimeout,
        WriteTimeout: config.WriteTimeout,
        IdleTimeout:  config.IdleTimeout,
    }
    
    return &Server{
        httpServer: server,
        config:     config,
        mux:        mux,
    }
}

// AddRoute adds a new route to the server with middleware
func (s *Server) AddRoute(pattern string, handler http.HandlerFunc, middlewares ...func(http.HandlerFunc) http.HandlerFunc) {
    finalHandler := handler
    
    // Apply middlewares in reverse order
    for i := len(middlewares) - 1; i >= 0; i-- {
        finalHandler = middlewares[i](finalHandler)
    }
    
    s.mux.HandleFunc(pattern, finalHandler)
}

// Start starts the HTTP server
func (s *Server) Start() error {
    log.Printf("Starting server on port %d", s.config.Port)
    return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the server
func (s *Server) Shutdown(ctx context.Context) error {
    log.Println("Shutting down server...")
    return s.httpServer.Shutdown(ctx)
}

// JSONResponse sends a JSON response with the given status code
func JSONResponse(w http.ResponseWriter, status int, data interface{}) error {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    
    response := Response{
        Data:   data,
        Status: status,
    }
    
    return json.NewEncoder(w).Encode(response)
}

// ErrorResponse sends an error response with the given status code and message
func ErrorResponse(w http.ResponseWriter, status int, message string) error {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    
    response := Response{
        Error:  message,
        Status: status,
    }
    
    return json.NewEncoder(w).Encode(response)
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    }
}`
  }
};

export function DemoPlayground() {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof codeExamples>('javascript');
  const [codeInput, setCodeInput] = useState(codeExamples.javascript.example);
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'html' | 'json'>('markdown');
  const [docStyle, setDocStyle] = useState<'concise' | 'detailed'>('detailed');
  const [result, setResult] = useState<DemoResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generateDocsMutation = useMutation({
    mutationFn: async (data: { code: string; language: string; format: string; style: string }) => {
      const response = await apiRequest('POST', '/api/generate-docs', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleLanguageChange = (language: keyof typeof codeExamples) => {
    setSelectedLanguage(language);
    setCodeInput(codeExamples[language].example);
  };

  const handleGenerate = () => {
    generateDocsMutation.mutate({
      code: codeInput,
      language: selectedLanguage,
      format: outputFormat,
      style: docStyle
    });
  };

  const handleCopy = async (content: string, type: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentation.${type === 'html' ? 'html' : type === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearInput = () => {
    setCodeInput('');
    setResult(null);
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          Interactive Demo Playground
        </CardTitle>
        <CardDescription className="text-lg">
          Paste your code below and watch Auto-Docs generate beautiful documentation in real-time
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration Panel */}
        <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Programming Language</label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(codeExamples).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Output Format</label>
            <Select value={outputFormat} onValueChange={(value: 'markdown' | 'html' | 'json') => setOutputFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Documentation Style</label>
            <Select value={docStyle} onValueChange={(value: 'concise' | 'detailed') => setDocStyle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleGenerate}
              disabled={!codeInput.trim() || generateDocsMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {generateDocsMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Docs
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Your Code
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCodeInput(codeExamples[selectedLanguage].example)}>
                Load Example
              </Button>
              <Button variant="outline" size="sm" onClick={clearInput}>
                Clear
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder={`Paste your ${codeExamples[selectedLanguage].name} code here...`}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {codeInput.length} characters
            </div>
          </div>
        </div>

        {/* Error State */}
        {generateDocsMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to generate documentation. Please check your code and try again.
              {generateDocsMutation.error instanceof Error && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="text-xs mt-1 p-2 bg-red-50 rounded">
                    {generateDocsMutation.error.message}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Separator />
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Documentation
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="secondary">
                    Generated in {result.processingTime}ms
                  </Badge>
                  <span>{result.stats.functionsCount} functions</span>
                  <span>{result.stats.classesCount} classes</span>
                  <span>{result.stats.exportsCount} exports</span>
                </div>
              </div>

              <Tabs value={outputFormat} onValueChange={(value: string) => setOutputFormat(value as 'markdown' | 'html' | 'json')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="markdown" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Markdown Output</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(result.markdown, 'markdown')}
                      >
                        {copied === 'markdown' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied === 'markdown' ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(result.markdown, 'markdown')}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">{result.markdown}</pre>
                  </div>
                </TabsContent>

                <TabsContent value="html" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">HTML Output</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(result.html, 'html')}
                      >
                        {copied === 'html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied === 'html' ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(result.html, 'html')}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">{result.html}</pre>
                  </div>
                </TabsContent>

                <TabsContent value="json" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">JSON Output</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(result.json, 'json')}
                      >
                        {copied === 'json' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied === 'json' ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(result.json, 'json')}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">{result.json}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {generateDocsMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center gap-3 text-lg">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6 text-blue-500" />
              </motion.div>
              AI is analyzing your code and generating documentation...
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This usually takes 2-5 seconds
            </p>
          </motion.div>
        )}

        {/* Call to Action */}
        {!result && !generateDocsMutation.isPending && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to see the magic?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Paste your code above and click "Generate Docs" to see Auto-Docs in action
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={!codeInput.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Documentation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
