# Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

Every push to the `main` branch automatically:
1. Builds the application
2. Deploys to GitHub Pages
3. Makes it available at: `https://marcato-.github.io/proto/`

### Setup Instructions

#### One-Time Setup

1. **Enable GitHub Pages** in your repository:
   - Go to repository Settings
   - Navigate to Pages (in the sidebar)
   - Under "Build and deployment"
   - Set Source to: **GitHub Actions**

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Wait for deployment**:
   - Go to the Actions tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Once complete, your app will be live!

### Accessing Your Application

After deployment, your BPMN modeling tool will be available at:

**https://marcato-.github.io/proto/**

### Manual Build (Optional)

To build the application locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

### Workflow Details

The deployment workflow (`.github/workflows/deploy.yml`):
- Triggers on push to `main` branch
- Can also be triggered manually from the Actions tab
- Builds with Node.js 20
- Uploads build artifacts to GitHub Pages
- Deploys automatically

### Troubleshooting

**If deployment fails:**

1. Check the Actions tab for error messages
2. Ensure GitHub Pages is enabled with "GitHub Actions" as the source
3. Verify the workflow has the necessary permissions
4. Check that all dependencies install successfully

**If the app doesn't load:**

1. Clear your browser cache
2. Check browser console for errors
3. Verify the base path in `vite.config.js` matches your repository name
4. Ensure all assets are loading from the correct path

### Branch Protection

If you have branch protection on `main`:
- Ensure the GitHub Actions bot can push
- Or deploy from a different branch by updating the workflow

### Custom Domain (Optional)

To use a custom domain:

1. Add a `public/CNAME` file with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in repository settings

---

For more information, see the [GitHub Pages documentation](https://docs.github.com/en/pages).
