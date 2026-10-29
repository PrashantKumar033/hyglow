Hyglow Vercel patch

1. Copy vercel.json into the Hyglow repository root (next to package.json and pnpm-workspace.yaml).
2. Before deploying, replace YOUR-RENDER-SERVICE in the first rewrite destination with the exact hostname shown by Render, e.g. your-service.onrender.com. Keep /api/:path* at the end.
3. Commit and push vercel.json to the main branch.
4. Import the repository in Vercel with Root Directory set to ./ (repository root) and Framework Preset set to Other.

Note: This patch does not contain API/database secrets. The API hostname is intentionally a placeholder because it could not be verified from the project archive.
