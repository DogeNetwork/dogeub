<div align="center">
  
  <img src="https://github.com/DogeNetwork/dogeub/blob/main/public/logo.svg" width="322" />
  <br />

  [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/I3I81MF4CH) ![](https://dcbadge.limes.pink/api/server/https://discord.gg/unblocking?compact=true)


  <hr />
  DogeUB version 5 is finally here!

  
  <br />
  <br />

  <img width="1278" height="628" alt="image" src="preview.png" />


</div>

## Overview

DogeUB is a browser-in-browser style internet hub that brings together web apps, tools, and games in one place, built with [React](https://github.com/facebook/react).

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

#### Deploying with Docker:

```bash
docker run -d \
  --name dogeub \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  ghcr.io/dogenetwork/dogeub:latest
```

> [!NOTE]
> If accessing over a network instead of localhost, you will need to provide a valid SSL certificate (e.g., using a reverse proxy like Nginx or Caddy). This is required for the built-in service worker to function properly.

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
