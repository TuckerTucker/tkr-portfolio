```javascript
export default {
  // Set the base path to match your GitHub repository name
  base: "/your-repo-name/"
}
```
```yaml
name: Deploy Ladle to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '16.x'
      - run: npm ci
      - run: npm run build-ladle
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: "./build"
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```
```json
"scripts": {
  "build-ladle": "ladle build"
}
```
You can host Ladle on GitHub Pages by following these steps:
1. Configure your Ladle settings by creating or updating your `.ladle/config.js` file with the base path setting:
2. Create a GitHub Actions workflow file at `.github/workflows/deploy.yml`:
3. Add a build script to your `package.json`:
4. In your GitHub repository settings:
   - Go to Settings > Pages
   - Under "Build and deployment", select "GitHub Actions"
After pushing these changes to your repository, GitHub Actions will build your Ladle stories and deploy them to GitHub Pages. Your Ladle instance will be available at `https://username.github.io/your-repo-name`.
The base path configuration is particularly important as it ensures that all assets are loaded correctly when your site is hosted on GitHub Pages[6].

Sources
[1] How to Host a Website On Github Pages - YouTube https://www.youtube.com/watch?v=OltY8JIaP-4
[2] Publish Storybook | Storybook docs https://storybook.js.org/docs/sharing/publish-storybook
[3] How to host your first site for free on GitHub Pages - DEV Community https://dev.to/github/how-to-host-your-first-site-for-free-on-github-pages-45ob
[4] Trying out Ladle - A Storybook Alternative - DEV Community https://dev.to/mbarzeev/trying-out-ladle-a-storybook-alternative-f68
[5] About GitHub Pages https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
[6] Config | Ladle https://ladle.dev/docs/config/
[7] GitHub Pages | Websites for you and your projects, hosted directly ... https://pages.github.com
[8] tajo/ladle: Develop, test and document your React story ... - GitHub https://github.com/tajo/ladle
