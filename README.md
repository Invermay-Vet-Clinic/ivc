# Static site starter

This repo is a minimal static website you can edit in VS Code and deploy with GitHub Pages.

Quick steps (local -> GitHub -> GitHub Pages)
1. Open a terminal in the project folder.
2. Initialize git and commit:
   - git init
   - git add .
   - git commit -m "Initial commit"
3. Create a GitHub repository (replace <repo> and your username):
   - git remote add origin https://github.com/<your-username>/<repo>.git
   - git branch -M main
   - git push -u origin main

Or use the GitHub web UI to create a repo and push from VS Code.

Enable GitHub Pages
1. In the GitHub repo go to Settings → Pages.
2. Under "Source", choose `main` branch and `/ (root)` folder, then Save.
3. In the "Custom domain" box, enter `invermayvetclinic.com.au` (or your domain) — GitHub will create and enable HTTPS once DNS is correct.

DNS (VentraIP) — what to add
If VentraIP is your DNS host (nameservers point to VentraIP), add these records in VentraIP's DNS manager:

- A records for the apex (host = @ or leave blank) pointing to:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

- CNAME for `www`:
  - Host: www
  - Value: <your-github-username>.github.io   (for example: elizabethjkelly.github.io)

Also include the `CNAME` file (already present) at the repo root with your custom domain.

Notes & troubleshooting
- If your nameservers are NOT VentraIP (for example Cloudflare or another host), update DNS at the provider shown in your domain's nameserver settings.
- Wait a few minutes to a couple of hours for DNS propagation. Use `dig` or an online DNS checker.
- After DNS updates and adding the custom domain in GitHub Pages, GitHub will provision HTTPS automatically. Enable "Enforce HTTPS" in Pages settings if available.
- If you use Cloudflare, set the record to DNS-only (no proxy/grey-cloud) for GitHub Pages to work reliably.

Commands to check DNS:
- dig +short A invermayvetclinic.com.au
- dig +short CNAME www.invermayvetclinic.com.au
- dig +short TXT _github-challenge.invermayvetclinic.com.au (only if GitHub asks for a TXT for verification)

That's it — edit index.html and styles.css in VS Code and commit/push to publish.