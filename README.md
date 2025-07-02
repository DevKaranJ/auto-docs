# Auto-Docs: AI-Powered Documentation Generator

[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/yourrepo/ci.yml?branch=main&style=flat-square)](https://github.com/yourusername/yourrepo/actions)
[![Docker](https://img.shields.io/docker/pulls/yourdockerhubuser/yourimage?style=flat-square)](https://hub.docker.com/r/yourdockerhubuser/yourimage)
[![Site Status](https://img.shields.io/website-up-down-green-red/http/yourwebsite.com.svg?style=flat-square)](http://yourwebsite.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/your-package-name?style=flat-square)](https://www.npmjs.com/package/your-package-name)

Auto-Docs is a production-ready, open-source AI-powered documentation generator that automatically creates beautiful, professional documentation from codebases using OpenAI GPT-4.

## Features

- 🤖 **AI-Powered**: Uses OpenAI GPT-4 to generate intelligent, context-aware documentation
- 🌐 **Multi-Language Support**: JavaScript, TypeScript, Python, and Go
- 📄 **Multiple Formats**: Generate documentation in Markdown, HTML, or JSON
- 🎨 **Beautiful Output**: Professional styling and formatting
- ⚡ **Fast Processing**: Efficient code parsing and generation
- 🔧 **CLI Tool**: Easy-to-use command-line interface
- 🌐 **Web Demo**: Interactive web interface for testing

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd auto-docs
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/autodocs
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=autodocs

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Session Configuration
SESSION_SECRET=your-secure-session-secret-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

4. **Set up the database:**
```bash
# Create the database
createdb autodocs

# Push the schema to the database
npm run db:push
```

5. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Web Interface

To run the frontend locally, use the following command:
```bash
npx vite --host
```

1. Open `http://localhost:5000` in your browser
2. Paste your code in the demo interface
3. Select the programming language and output format
4. Click "Generate Documentation" to see the AI-generated docs

### CLI Tool (Coming Soon)

```bash
# Generate documentation for a project
npx auto-docs generate ./src --format markdown --style detailed

# Watch for changes and regenerate
npx auto-docs watch ./src --format html
```

## Database Setup

### Local PostgreSQL

1. **Install PostgreSQL:**
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from postgresql.org

2. **Create database and user:**
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE autodocs;
CREATE USER autodocs_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE autodocs TO autodocs_user;
```

3. **Update your .env file with the correct DATABASE_URL**

## OpenAI API Setup

1. Go to https://platform.openai.com/
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `.env` file as `OPENAI_API_KEY`

**Note:** You'll need to add credits to your OpenAI account to use the API.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `SESSION_SECRET` | Secret for session encryption | Yes | - |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature-name`
7. Submit a pull request

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `sudo service postgresql start`
- Check connection string in `.env`
- Verify database exists: `psql -U username -d autodocs`

### OpenAI API Issues

- Verify API key is correct and has credits
- Check API usage at https://platform.openai.com/usage
- Ensure `OPENAI_API_KEY` is set in `.env`

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.
