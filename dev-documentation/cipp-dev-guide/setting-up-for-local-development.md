# Setting Up for Local Development

CIPP  lives in a single mono-repository — [CyberDrain/CIPP](https://github.com/CyberDrain/CIPP), containing both the frontend (`frontend/`) and the API (`backend/`). The old CIPP and CIPP-API repositories are deprecated and only kept in sync for backward compatibility.

Local development runs in **Docker**. The compose files in `build/` start everything you need:

| Service        | What it is                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cipp-azurite` | Azurite, the local Azure Storage emulator (your dev database)                                                                                              |
| `cipp-api`     | The CRAFT API runtime with your local `backend/` folder mounted into it — backend changes go live automatically via a container restart                    |
| Frontend       | The Next.js dev server with hot reload — runs in a container on Linux, or on your host on Windows (bind mounts are too slow for `node_modules` on Windows) |

Everything is served same-origin through **http://localhost:5196.**

### Prerequisites

* [Git](https://git-scm.com/)
* **Docker** — [Docker Desktop](https://www.docker.com/products/docker-desktop/) on Windows, or Docker Engine with the compose plugin on Linux. Docker is required; the entire dev environment runs in containers.
* **When developing on Windows:**&#x20;
  * [PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows)
  * [Windows Terminal](https://aka.ms/terminal)
  * [Node.js 22](https://nodejs.org/) with Yarn enabled (`corepack enable`)

Fork [CyberDrain/CIPP](https://github.com/CyberDrain/CIPP), clone it, and check out the `dev` branch (active development happens on `dev`; `main` is stable release code):

```bash
git clone https://github.com/<your-username>/CIPP.git
cd CIPP
git checkout dev
```

### For development on Windows

Make sure Docker Desktop is running, then start everything with one script:

```powershell
.\build\tools\Start-Cipp-Dev-Windows-docker.ps1
```

The script opens Windows Terminal with three tabs:

1. **CIPP-Docker** — compiles the CIPP PowerShell modules, then runs `docker compose -f docker-compose-no-frontend.yml up --pull always --watch` (Azurite + API).
2. **CIPP Modules** — a watcher (`Watch-Cipp-Dev-Modules.ps1`) that recompiles a module when you edit its source under `backend/Modules` and restarts the API container, so backend changes go live in seconds.
3. **CIPP Frontend** — `yarn install` + the Next.js dev server on your host, with hot reload.

Once the containers are up, open **http://localhost:5196**.

To stop: `Ctrl+C` in the tabs, or `docker compose -f docker-compose-no-frontend.yml down` from the `build` folder.

### For development on Linux

Everything (including the frontend) runs in containers. From the repo root:

```bash
cd build
docker volume create cipp-ng_azurite-data
docker volume create cipp-frontend_node_modules
docker volume create cipp-frontend_out_dev
docker compose -f docker-compose-all.yml up --pull always --watch
```

The first start takes a few minutes while images are pulled and `yarn install` runs inside the frontend container. Once it's up, open **http://localhost:5196**.

* Frontend edits hot-reload automatically.
* Backend edits under `backend/Modules`, `backend/Shared`, or `backend/Config` restart the API container automatically (`--watch`).

To stop: `Ctrl+C`, or `docker compose -f docker-compose-all.yml down`.

### Good to know

* **All your data lives in Azurite**, in the `cipp-ng_azurite-data` Docker volume, and survives restarts. Delete the volume for a factory-reset dev environment.
* **Ports**: `5196` is the app + API (use this one for local development), `3000` is the raw Next.js dev server, `10000-10002` are Azurite.
* **Pull requests** go to the `dev` branch of [CyberDrain/CIPP](https://github.com/CyberDrain/CIPP) and must apply convential commits.
