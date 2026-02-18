<div align="center">
  
  <img src="https://github.com/DogeNetwork/dogeub/blob/main/public/logo.svg" width="322" />
  <br />

  [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/I3I81MF4CH) ![](https://dcbadge.limes.pink/api/server/https://discord.gg/unblocking?compact=true)


  <hr />
  DogeUB (Doge Unblocker) version 5 is finally here!

  
  <br />
  <br />

  <img width="1278" height="628" alt="image" src="preview.png" />


</div>

## Overview

DogeUB is a web proxy frontend / internet browsing hub, allowing you to surf the web anonymously while providing a full suite of apps and games, built with [React](https://github.com/facebook/react).

> [!IMPORTANT]
> Please consider starring our repository if you are forking it!

### List of features:

| Feature | Implemented |
|---------|-------------|
| Web Proxy | Yes |
| Browser-like UI | Yes |
| App player UI | Yes |
| Cloak features | Partially |
| Game Downloader | Yes |
| Quick Links | Yes |
| DuckDuckGo Search API | Yes |
| Apps & Games | Yes |
| Search Engine Switcher | Yes |
| Themes/Site Customization | Yes |

---

### Development & Building

#### Production:
```bash
git clone https://github.com/DogeNetwork/dogeub.git
cd dogeub
npm i
npm run build
node server.js
```

#### Development:

```bash
git clone https://github.com/DogeNetwork/dogeub.git
cd dogeub
npm i
npm run dev
```
---

#### Deploying in Docker:

```bash
docker run -d \
  --name dogeub \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  ghcr.io/gitlogos/dogeub_docker:latest
```

#### Deploying with Docker Compose:

```bash
services:
  dogeub:
    image: ghcr.io/gitlogos/dogeub_docker:latest
    container_name: dogeub
    restart: unless-stopped

    # Expose the web UI (host:container)
    ports:
      - "3000:3000"

    # App runtime settings (DogeUB expects PORT in env-style configs)
    environment:
      - NODE_ENV=production
      - PORT=3000
      # Optional toggles used by DogeUB upstream (if your server.js honors them)
      # - BARE="false"
      # - MASQR="false"
```

If accessing over lan instead of localhost, then you need to provide a valid SSL certificate. 
This is needed for the built in service worker.

#### Deploying in Docker with Caddy for valid ssl certificate:

```bash
services:
  dogeub:
    image: ghcr.io/gitlogos/dogeub_docker:latest
    container_name: dogeub
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000

  caddy:
    image: caddy:latest
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - MY_DOMAIN=example.com  # <-- User just changes this
    volumes:
      - caddy_data:/data
      - caddy_config:/config
      - ./Caddyfile:/etc/caddy/Caddyfile # Persist it to the host
    # This script runs every time the container starts
    entrypoint: /bin/sh -c "
      if [ ! -f /etc/caddy/Caddyfile ]; then
        echo 'Creating initial Caddyfile...';
        printf '%s {\n    reverse_proxy dogeub:3000\n}' \"\$$MY_DOMAIN\" > /etc/caddy/Caddyfile;
      fi;
      exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"

volumes:
  caddy_data:
  caddy_config:
```

---

### Contributors / Developers

| Name          | Role               | GitHub |
| ------------- | ------------------ | ------ |
| Derpman | Lead Developer     |      [@qerionx](https://github.com/qerionx) |
| Fowntain | Project Manager | [@fowntain](https://github.com/fowntain)     |
| Akane | Contributor | [@genericness](https://github.com/genericness)     |
| DJshelfmushroom | Contributor | [@DJshelfmushroom](https://github.com/DJshelfmushroom)     |


> [!NOTE]
> Want to be on this list? Make a few pull requests!

---

### Made possible thanks to:

* [MercuryWorkshop/wisp-server-node](https://github.com/MercuryWorkshop/wisp-server-node)
* [MercuryWorkshop/scramjet](https://github.com/MercuryWorkshop/scramjet)
* [titaniumnetwork-dev/Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet)
* [lucide-icons/lucide](https://github.com/lucide-icons/lucide)
* [pmndrs/zustand](https://github.com/pmndrs/zustand)
* [Stuk/jszip](https://github.com/Stuk/jszip)

## License

This project is licensed under the **GNU Affero GPL v3**.  
See the [LICENSE](LICENSE) file for more details.
