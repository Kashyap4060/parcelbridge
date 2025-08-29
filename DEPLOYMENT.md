# Parcel Bridge Deployment Guide

## 🚀 Deploying to Firebase Hosting with Custom Domain (parcelbridge.in)

### Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project configured (parcel-bridge-4088)
- Domain `parcelbridge.in` purchased and accessible

### Step 1: Build the Application
```bash
npm run build
```

### Step 2: Deploy to Firebase Hosting
```bash
# Deploy to production
npm run deploy

# Or deploy to preview channel for testing
npm run deploy:preview
```

### Step 3: Configure Custom Domain

#### Option A: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `parcel-bridge-4088`
3. Go to Hosting section
4. Click "Add custom domain"
5. Enter `parcelbridge.in`
6. Follow the verification steps provided by Firebase

#### Option B: Using Firebase CLI
```bash
# Add custom domain
firebase hosting:sites:create parcelbridge-in

# Link domain to hosting site
firebase target:apply hosting parcelbridge parcelbridge-in

# Deploy to custom domain
firebase deploy --only hosting:parcelbridge
```

### Step 4: DNS Configuration
Configure your domain registrar's DNS settings:

#### For parcelbridge.in (root domain):
- **Type**: A Record
- **Name**: @ (or leave blank)
- **Value**: Firebase IP addresses (provided during domain setup)

#### For www.parcelbridge.in (subdomain):
- **Type**: CNAME
- **Name**: www
- **Value**: parcelbridge-in.web.app

### Step 5: SSL Certificate
Firebase automatically provisions SSL certificates for custom domains. This may take a few hours to complete.

### Step 6: Verify Deployment
1. Visit `https://parcelbridge.in`
2. Check that all pages load correctly
3. Verify PWA manifest works
4. Test authentication flows
5. Ensure all assets load over HTTPS

## 🔧 Environment Configuration

### Production Environment Variables
Make sure these are configured in your Firebase project:

```javascript
// Firebase config for production
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "parcel-bridge-4088.firebaseapp.com",
  projectId: "parcel-bridge-4088",
  storageBucket: "parcel-bridge-4088.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 📊 Post-Deployment Checklist

### SEO & Performance
- [ ] Verify robots.txt is accessible at `/robots.txt`
- [ ] Check sitemap.xml at `/sitemap.xml`
- [ ] Test page load speeds with Google PageSpeed Insights
- [ ] Verify social media meta tags (Open Graph, Twitter Cards)

### PWA Features
- [ ] Test "Add to Home Screen" functionality
- [ ] Verify offline capabilities
- [ ] Check PWA manifest validation

### Security
- [ ] Verify HTTPS is enforced
- [ ] Test security headers
- [ ] Check CSP (Content Security Policy)

### Analytics & Monitoring
- [ ] Set up Google Analytics (if not already configured)
- [ ] Configure Firebase Analytics
- [ ] Set up error monitoring
- [ ] Monitor Core Web Vitals

## 🎯 Domain-Specific Features

### Custom Domain Benefits
- **Professional Branding**: parcelbridge.in looks more professional than Firebase subdomain
- **SEO Optimization**: Better search engine indexing with custom domain
- **Trust Factor**: Users trust custom domains more for financial transactions
- **Brand Recognition**: Easier to remember and share

### Email Configuration
Consider setting up professional email addresses:
- support@parcelbridge.in
- business@parcelbridge.in
- privacy@parcelbridge.in
- legal@parcelbridge.in

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Set up automated deployment from GitHub:

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: parcel-bridge-4088
```

## 🚨 Troubleshooting

### Common Issues
1. **Domain not propagating**: DNS changes can take up to 48 hours
2. **SSL certificate pending**: Firebase SSL provisioning can take several hours
3. **Build errors**: Check Node.js version compatibility
4. **Routing issues**: Ensure rewrites are configured correctly in firebase.json

### Support Resources
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Next.js Static Export Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Ready to go live at parcelbridge.in! 🎉**
