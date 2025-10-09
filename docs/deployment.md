# TrackToDo Deployment Guide

## Overview

This guide covers deploying the TrackToDo application to various platforms and environments. The application consists of a React frontend and a Node.js backend API.

## Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of web development
- Access to deployment platform

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/gauravcs23066/TrackToDo.git
cd TrackToDo
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start Development Servers

#### Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

#### Frontend Server
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## Production Deployment

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Backend Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Optional: Database configuration (if using external database)
# DATABASE_URL=your-database-url
```

### Backend Deployment

#### 1. Build and Start
```bash
cd backend
npm install --production
npm start
```

#### 2. Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start src/server.js --name "tracktodo-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Using Docker
```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t tracktodo-backend .
docker run -p 3001:3001 tracktodo-backend
```

### Frontend Deployment

#### 1. Build for Production
```bash
cd frontend
npm run build
```

#### 2. Serve Static Files
```bash
# Using serve package
npm install -g serve
serve -s build -l 3000

# Using nginx
# Copy build files to nginx web root
cp -r build/* /var/www/html/
```

#### 3. Using Docker
```dockerfile
# Dockerfile for frontend
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

## Platform-Specific Deployment

### Heroku Deployment

#### 1. Backend (Heroku)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create tracktodo-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://tracktodo-frontend.herokuapp.com

# Deploy
git push heroku main
```

#### 2. Frontend (Heroku)
```bash
# Create Heroku app
heroku create tracktodo-frontend

# Set buildpack
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack

# Deploy
git push heroku main
```

### Vercel Deployment

#### 1. Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### 2. Backend (Vercel)
```bash
# Deploy backend
cd backend
vercel --prod
```

### Netlify Deployment

#### 1. Frontend (Netlify)
```bash
# Build command
npm run build

# Publish directory
build

# Environment variables
REACT_APP_API_URL=https://your-api-domain.com
```

#### 2. Backend (Netlify Functions)
```bash
# Create netlify/functions directory
mkdir -p netlify/functions

# Move server.js to netlify/functions/api.js
# Configure for serverless deployment
```

### AWS Deployment

#### 1. EC2 Instance
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup application
git clone https://github.com/gauravcs23066/TrackToDo.git
cd TrackToDo

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Start services
pm2 start backend/src/server.js --name "tracktodo-api"
pm2 start "serve -s frontend/build -l 3000" --name "tracktodo-frontend"
```

#### 2. S3 + CloudFront
```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Configure CloudFront distribution
# Point to S3 bucket
```

### DigitalOcean Deployment

#### 1. Droplet Setup
```bash
# Create droplet with Node.js image
# SSH into droplet

# Install dependencies
sudo apt update
sudo apt install nginx

# Clone repository
git clone https://github.com/gauravcs23066/TrackToDo.git
cd TrackToDo

# Setup backend
cd backend
npm install --production
pm2 start src/server.js --name "tracktodo-api"

# Setup frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
```

#### 2. Nginx Configuration
```nginx
# /etc/nginx/sites-available/tracktodo
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Configuration

### Local JSON Storage (Default)
The application uses local JSON file storage by default. No additional setup required.

### External Database (Optional)
To use an external database, modify the backend configuration:

#### MongoDB
```bash
# Install MongoDB driver
npm install mongodb

# Update backend/src/server.js
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
```

#### PostgreSQL
```bash
# Install PostgreSQL driver
npm install pg

# Update backend/src/server.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

## SSL/HTTPS Configuration

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure page rules for HTTPS redirect

## Monitoring and Logging

### Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Monitor application
pm2 monit
pm2 logs tracktodo-api
```

### Log Management
```bash
# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## Security Considerations

### Environment Security
- Use environment variables for sensitive data
- Never commit `.env` files
- Use strong passwords and API keys
- Enable firewall rules
- Keep dependencies updated

### Application Security
- Enable CORS properly
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs
- Sanitize user data

### Server Security
- Keep system updated
- Use SSH keys instead of passwords
- Configure firewall rules
- Monitor access logs
- Regular security audits

## Performance Optimization

### Backend Optimization
- Enable gzip compression
- Use connection pooling
- Implement caching
- Monitor memory usage
- Optimize database queries

### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images
- Minify CSS/JS

### Server Optimization
- Use reverse proxy (nginx)
- Enable HTTP/2
- Configure caching headers
- Monitor server resources
- Scale horizontally when needed

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 PID
```

#### Permission Denied
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/app
chmod -R 755 /path/to/app
```

#### Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Log Analysis
```bash
# Check application logs
pm2 logs tracktodo-api

# Check system logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log
```

## Backup and Recovery

### Data Backup
```bash
# Backup application data
cp -r backend/data/ backup/
tar -czf tracktodo-backup-$(date +%Y%m%d).tar.gz backup/

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /backups/tracktodo-$DATE.tar.gz /path/to/app/data/
find /backups -name "tracktodo-*.tar.gz" -mtime +30 -delete
```

### Recovery Process
```bash
# Restore from backup
tar -xzf tracktodo-backup-20231201.tar.gz
cp -r backup/* backend/data/
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple backend instances
- Use shared storage for data
- Implement session management

### Vertical Scaling
- Increase server resources
- Optimize application code
- Use faster storage (SSD)
- Monitor resource usage

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor disk space
- Check application logs
- Review security updates
- Backup data regularly

### Monitoring Checklist
- [ ] Application is running
- [ ] API endpoints responding
- [ ] Database connections healthy
- [ ] SSL certificates valid
- [ ] Backup processes working
- [ ] Security updates applied
- [ ] Performance metrics normal

## Support and Resources

### Documentation
- API Documentation: `/docs/API.md`
- User Guide: `/docs/user-guide.md`
- Test Documentation: `/tests/README.md`

### Community
- GitHub Issues: Report bugs and feature requests
- GitHub Discussions: Ask questions and share ideas
- Pull Requests: Contribute to the project

### Professional Support
For enterprise deployments or custom requirements, contact the development team for professional support and consulting services.
