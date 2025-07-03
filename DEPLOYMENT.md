# Auto-Docs Deployment Guide

This guide covers deploying Auto-Docs for local development, production, and GitHub setup.

## Local Development Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 13+
- OpenAI API key with credits

### 2. Clone and Setup
```bash
git clone <https://github.com/DevKaranJ/auto-docs>
cd auto-docs
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Add your `OPENAI_API_KEY`
- Set a secure `SESSION_SECRET`

### 4. Database Setup
```bash
# Use existing PostgreSQL
createdb autodocs
npm run db:push
```

### 5. Development Server
```bash
npm run dev
```

Visit `http://localhost:5000`

## Production Deployment

### Manual Production Setup
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
export OPENAI_API_KEY="sk-..."
export SESSION_SECRET="..."

# Start application
npm start
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/autodocs` |
| `OPENAI_API_KEY` | Yes | OpenAI API key | `sk-...` |
| `SESSION_SECRET` | Yes | Session encryption secret | `your-secret-here` |
| `PORT` | No | Server port (default: 5000) | `3000` |
| `NODE_ENV` | No | Environment mode | `production` |

## Database Migration

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:push

# Open database studio
npm run db:studio
```

## Health Checks

### API Health
```bash
curl http://localhost:5000/api/user
# Should return 401 Unauthorized (expected when not logged in)
```

### Database Health
```bash
npm run db:studio
# Should open Drizzle Studio at http://localhost:4983
```

### AI Service Health
```bash
curl -X POST http://localhost:5000/api/generate-docs \
  -H "Content-Type: application/json" \
  -d '{"code":"function test() { return true; }","language":"javascript","format":"markdown","style":"concise"}'
# Should return documentation or graceful fallback
```

## Troubleshooting

### Database Connection Issues
1. Check PostgreSQL is running: `pg_isready`
2. Verify connection string in `.env`
3. Check database exists: `psql $DATABASE_URL -c "SELECT 1;"`

### OpenAI API Issues
1. Verify API key has credits: https://platform.openai.com/usage
2. Test API key: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`

### Port Issues
1. Check if port is in use: `lsof -i :5000`
2. Change port in `.env`: `PORT=3000`

### Build Issues
1. Clear build cache: `rm -rf dist node_modules && npm install`
2. Check Node.js version: `node --version` (should be 18+)

## Security Considerations

### Production Security
- Use strong `SESSION_SECRET` (32+ random characters)
- Enable SSL/TLS in production
- Set secure cookie settings
- Regularly rotate API keys
- Keep dependencies updated

### Database Security
- Use strong database passwords
- Restrict database access to application only
- Enable SSL for database connections
- Regular database backups

## Monitoring

### Application Logs
```bash
# PM2 (if using)
pm2 logs

# Manual
tail -f logs/app.log
```

### Performance Metrics
- Monitor OpenAI API usage and costs
- Track documentation generation times
- Monitor database performance
- Set up alerts for errors

## Backup and Recovery

### Database Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Application Backup
```bash
tar -czf autodocs-backup.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.env \
  .
```

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple application instances
- Shared database and session store
- CDN for static assets

### Database Scaling
- Connection pooling
- Read replicas for scaling reads
- Database monitoring and optimization

## Support

For deployment issues:
1. Check this deployment guide
2. Review application logs
3. Raise Issue 
4. Contact Owner
