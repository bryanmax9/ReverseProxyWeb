# Netlify Reverse Proxy Setup

This repository is configured to deploy directly to **Netlify** and will act as a reverse proxy for your TerraMaster NAS at `172.222.155.52:8181`.

Since you are hosting on Netlify, we don't need Docker or Nginx. Netlify has robust, built-in reverse proxy functionally utilizing Edge Networks!

## How it works

The logic is stored in the `netlify.toml` file:

1. **Automatic Redirection:** When someone visits exactly `https://caliteservicios.com/`, Netlify intercepts the request and redirects them to `https://caliteservicios.com/tos/index.php?user/login`.
2. **Reverse Proxying (Rewrites):** When traffic hits any other path (like `/tos/*`), Netlify acts as a middleman. It securely fetches the content from your old TerraMaster (`http://172.222.155.52:8181/...`) and delivers it to the user.
3. **Seamless Domain:** The process is invisible to the user. The address bar stays as `caliteservicios.com`, avoiding mixed content warnings on modern browsers too!

## Deployment

Simply commit and push this repository to GitHub/GitLab, and Netlify will deploy it automatically. There is nothing to "build"—it's instantaneous.
