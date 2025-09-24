# Deployment Guide for Solana Artisan Plaza

This guide covers deploying the Solana Artisan Plaza NFT marketplace to production.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_INFURA_PROJECT_ID=your-infura-project-id
   VITE_INFURA_PROJECT_SECRET=your-infura-project-secret
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

3. **Deploy**
   - Vercel will automatically detect Vite
   - Build command: `npm run build`
   - Output directory: `dist`

### Option 2: Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository

2. **Build Settings**
   ```yaml
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   - Add the same variables as above in Netlify's environment settings

### Option 3: Manual Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Web Server**
   ```bash
   # Apache
   cp -r dist/* /var/www/html/

   # Nginx
   cp -r dist/* /usr/share/nginx/html/

   # Static hosting (AWS S3, Google Cloud Storage, etc.)
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

## 🔧 Production Configuration

### Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `VITE_INFURA_PROJECT_ID` - Infura project ID
- [ ] `VITE_INFURA_PROJECT_SECRET` - Infura project secret
- [ ] `VITE_SOLANA_RPC_URL` - Mainnet RPC endpoint

### Database Setup

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Initialize project
   supabase init

   # Link to your remote project
   supabase link --project-ref your-project-id
   ```

2. **Run Migrations**
   ```bash
   supabase db push
   ```

3. **Seed Database (Optional)**
   ```bash
   supabase db reset
   ```

### IPFS Setup

1. **Create Infura Account**
   - Go to [Infura](https://infura.io)
   - Create a new project
   - Get your Project ID and Secret

2. **Configure IPFS**
   ```javascript
   // In your .env file
   VITE_INFURA_PROJECT_ID=your_project_id
   VITE_INFURA_PROJECT_SECRET=your_project_secret
   ```

## 🌐 Domain Configuration

### Custom Domain Setup

1. **Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Netlify**
   - Go to Site Settings > Domain management
   - Add custom domain
   - Update DNS records

### SSL Certificate

- **Automatic**: Vercel and Netlify provide automatic SSL
- **Manual**: Use Let's Encrypt for self-hosted deployments

## 🔍 Performance Optimization

### Build Optimization

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### Image Optimization

- Use WebP format for images
- Implement lazy loading
- Optimize image sizes
- Use CDN for static assets

### Caching Strategy

```javascript
// Add to index.html
<meta http-equiv="Cache-Control" content="public, max-age=31536000">
```

## 📊 Monitoring and Analytics

### Error Tracking

1. **Sentry Setup**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

   ```javascript
   // src/main.tsx
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "your-sentry-dsn",
     integrations: [new Sentry.BrowserTracing()],
     tracesSampleRate: 1.0,
   });
   ```

2. **Environment Variable**
   ```env
   VITE_SENTRY_DSN=your-sentry-dsn
   ```

### Analytics

1. **Google Analytics**
   ```javascript
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Environment Variable**
   ```env
   VITE_ANALYTICS_ID=GA_MEASUREMENT_ID
   ```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use different keys for development and production
- Rotate keys regularly
- Use secret management services

### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.supabase.co https://api.infura.io;
">
```

### Rate Limiting
- Implement rate limiting for API endpoints
- Use Supabase RLS (Row Level Security)
- Monitor for suspicious activity

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Ensure variables are prefixed with `VITE_`
   - Restart development server

3. **Wallet Connection Issues**
   - Verify RPC endpoint is accessible
   - Check wallet browser compatibility
   - Ensure proper network configuration

4. **Database Connection Errors**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure migrations are applied

### Logs and Debugging

1. **Browser Console**
   - Check for JavaScript errors
   - Monitor network requests
   - Verify API responses

2. **Supabase Logs**
   - Check Supabase dashboard for errors
   - Monitor database performance
   - Review API usage

3. **Deployment Logs**
   - Check Vercel/Netlify build logs
   - Monitor for runtime errors
   - Set up error alerting

## 📈 Scaling Considerations

### Database Scaling
- Monitor query performance
- Implement database indexes
- Consider read replicas for high traffic
- Use Supabase Edge Functions for compute

### CDN Setup
- Use CDN for static assets
- Implement image optimization
- Cache API responses
- Use edge computing for global performance

### Monitoring
- Set up uptime monitoring
- Monitor performance metrics
- Track user engagement
- Set up alerts for critical issues

## 🎯 Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Wallet connections work
- [ ] NFT creation functions
- [ ] Search functionality works
- [ ] User profiles load
- [ ] Database connections stable
- [ ] SSL certificate active
- [ ] Domain DNS configured
- [ ] Analytics tracking
- [ ] Error monitoring active
- [ ] Performance optimized
- [ ] Security measures in place

## 📞 Support

For deployment issues:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review deployment documentation
- Contact the development team

Happy deploying! 🚀
