# lwalden.github.io (Legacy)

This repository previously hosted my portfolio site. It now redirects to [lwalden.dev](https://lwalden.dev).

The active site source lives in the [lwalden-site](https://github.com/lwalden/lwalden-site) repository.

## How to deploy this redirect

1. Copy the contents of this directory (`index.html`) into the `lwalden.github.io` repository, replacing all existing files.
2. Delete any existing `CNAME` file (GitHub Pages should serve from the github.io domain, not a custom domain).
3. Push to `main`.
4. GitHub Pages will serve the redirect automatically.

The `<meta http-equiv="refresh">` and `window.location.replace()` cover all browsers.
The `<meta name="robots" content="noindex, follow">` tells Google to stop indexing the old domain and follow the redirect to lwalden.dev.
