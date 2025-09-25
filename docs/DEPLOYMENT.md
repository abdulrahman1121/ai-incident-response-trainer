# Deployment Guide

This guide covers the complete deployment process for EdgeIncidentDrill on Cloudflare.

## Prerequisites

### Required Accounts and Services
- Cloudflare account with Workers AI access
- Domain name (optional, for custom domain)
- Node.js 18+ installed locally
- Git for version control

### Required Permissions
- Cloudflare Workers permissions
- KV namespace creation permissions
- R2 bucket creation permissions
- Pages deployment permissions

## Step 1: Environment Setup

### Install Wrangler CLI
```bash
npm install -g wrangler
```

### Login to Cloudflare
```bash
wrangler login
```

### Verify Account Access
```bash
wrangler whoami
```

## Step 2: Create Required Resources

### Create KV Namespaces
```bash
# User preferences storage
wrangler kv:namespace create "USER_PREFERENCES"
wrangler kv:namespace create "USER_PREFERENCES" --preview

# Training data storage
wrangler kv:namespace create "TRAINING_DATA"
wrangler kv:namespace create "TRAINING_DATA" --preview
```

### Create R2 Bucket
```bash
wrangler r2 bucket create training-materials
```

### Create Durable Object
```bash
# The Durable Object is defined in wrangler.toml
# No additional creation needed
```

## Step 3: Configure wrangler.toml

Update the `wrangler.toml` file with your specific values:

```toml
name = "edge-incident-drill"
main = "src/workers/ai-assistant/index.ts"
compatibility_date = "2023-12-18"
compatibility_flags = ["nodejs_compat"]

# Replace with your account ID
account_id = "your-account-id-here"

# Update KV namespace IDs
[[kv_namespaces]]
binding = "USER_PREFERENCES"
id = "your-user-preferences-kv-id"
preview_id = "your-user-preferences-kv-preview-id"

[[kv_namespaces]]
binding = "TRAINING_DATA"
id = "your-training-data-kv-id"
preview_id = "your-training-data-kv-preview-id"

# Update R2 bucket names if different
[[r2_buckets]]
binding = "TRAINING_MATERIALS"
bucket_name = "training-materials"
preview_bucket_name = "training-materials-preview"
```

## Step 4: Deploy Workers

### Deploy AI Assistant Worker
```bash
wrangler deploy --name ai-assistant
```

### Deploy Workflow Orchestrator
```bash
wrangler deploy --name workflow-orchestrator
```

### Deploy State Manager (Durable Object)
```bash
wrangler deploy --name state-manager
```

## Step 5: Deploy Frontend (Pages)

### Build the Frontend
```bash
cd src/pages
npm install
npm run build
```

### Deploy to Pages
```bash
wrangler pages deploy dist --project-name edge-incident-drill
```

### Configure Custom Domain (Optional)
```bash
wrangler pages domain add edge-incident-drill.pages.dev your-domain.com
```

## Step 6: Configure Environment Variables

### Set Production Environment
```bash
wrangler secret put ENVIRONMENT
# Enter: production
```

### Set AI Model Configuration
```bash
wrangler secret put AI_MODEL_PRIMARY
# Enter: @cf/meta/llama-3.3-70b-instruct

wrangler secret put AI_MODEL_FAST
# Enter: @cf/meta/llama-3.3-8b-instruct
```

### Set Session Limits
```bash
wrangler secret put MAX_CONCURRENT_SESSIONS
# Enter: 1000
```

## Step 7: Upload Training Data

### Upload Scenarios to KV
```bash
# Upload scenarios data
wrangler kv:key put "scenarios" --path training-data/scenarios.json --binding TRAINING_DATA
```

### Upload Training Materials to R2
```bash
# Upload any additional training materials
wrangler r2 object put training-materials/scenarios.json --file training-data/scenarios.json
```

## Step 8: Configure Routes and Domains

### Set Up Custom Routes (Optional)
```bash
# Add custom routes in Cloudflare dashboard
# Example: your-domain.com/api/* -> ai-assistant worker
# Example: your-domain.com/workflow/* -> workflow-orchestrator worker
```

### Configure CORS (if needed)
Update your Workers to handle CORS for cross-origin requests:

```typescript
// Add to your Worker
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight requests
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders })
}
```

## Step 9: Testing and Validation

### Test AI Assistant
```bash
curl -X POST https://ai-assistant.your-subdomain.workers.dev/api/ai/health
```

### Test Workflow Orchestrator
```bash
curl -X GET https://workflow-orchestrator.your-subdomain.workers.dev/api/workflow/status?sessionId=test
```

### Test Frontend
Visit your Pages URL and verify:
- Home page loads correctly
- Navigation works
- Chat interface is functional
- Voice features work (if supported by browser)

## Step 10: Monitoring and Maintenance

### Set Up Monitoring
1. **Cloudflare Analytics**: Monitor Worker performance
2. **Custom Metrics**: Track training session metrics
3. **Error Logging**: Set up error tracking and alerts

### Regular Maintenance
1. **Update Dependencies**: Keep npm packages updated
2. **Monitor Performance**: Check response times and error rates
3. **Backup Data**: Regular backups of KV and R2 data
4. **Security Updates**: Keep Workers and dependencies secure

## Troubleshooting

### Common Issues

#### Worker Deployment Fails
```bash
# Check wrangler.toml syntax
wrangler dev

# Verify account permissions
wrangler whoami
```

#### KV Namespace Not Found
```bash
# List all KV namespaces
wrangler kv:namespace list

# Verify binding in wrangler.toml
```

#### Pages Deployment Issues
```bash
# Check build output
cd src/pages && npm run build

# Verify dist folder exists
ls -la dist/
```

#### AI Model Not Available
- Verify Workers AI access in Cloudflare dashboard
- Check model names are correct
- Ensure account has AI quota available

### Performance Optimization

#### Worker Optimization
- Minimize bundle size
- Use appropriate AI models for complexity
- Implement proper caching strategies

#### Frontend Optimization
- Enable Cloudflare's auto-minification
- Use appropriate image formats
- Implement lazy loading for components

## Security Considerations

### Environment Security
- Use Wrangler secrets for sensitive data
- Enable Cloudflare's security features
- Implement proper CORS policies

### Data Protection
- Encrypt sensitive data in KV
- Use secure headers in responses
- Implement rate limiting

### Access Control
- Use Cloudflare Access for admin functions
- Implement proper authentication
- Monitor for suspicious activity

## Scaling Considerations

### Worker Scaling
- Workers automatically scale with demand
- Monitor usage and adjust limits as needed
- Consider using Durable Objects for stateful operations

### Storage Scaling
- KV has automatic scaling
- R2 scales automatically
- Monitor storage usage and costs

### Frontend Scaling
- Pages automatically scales globally
- Use Cloudflare's CDN for optimal performance
- Consider edge-side rendering for better performance

## Cost Optimization

### Worker Costs
- Monitor execution time and optimize code
- Use appropriate AI models for task complexity
- Implement caching to reduce AI calls

### Storage Costs
- Monitor KV and R2 usage
- Implement data retention policies
- Use appropriate storage classes

### Bandwidth Costs
- Optimize frontend bundle size
- Use Cloudflare's image optimization
- Implement proper caching headers

## Backup and Recovery

### Data Backup
```bash
# Backup KV data
wrangler kv:key list --binding TRAINING_DATA > backup-training-data.json

# Backup R2 data
wrangler r2 object list training-materials > backup-r2-objects.json
```

### Recovery Procedures
1. Restore KV data from backups
2. Re-upload R2 objects
3. Redeploy Workers if needed
4. Verify functionality

## Support and Resources

### Documentation
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Documentation](https://developers.cloudflare.com/pages/)

### Community
- [Cloudflare Community](https://community.cloudflare.com/)
- [Workers Discord](https://discord.gg/cloudflaredev)
- [GitHub Issues](https://github.com/your-repo/issues)

### Professional Support
- Cloudflare Professional Services
- Enterprise Support (if applicable)
- Third-party consulting services
