# AGENTS.md

Instructions for AI agents working in this repository.

## Project

**das-fussball** is a fantasy-football-themed system for **practicing and teaching Kubernetes on AWS (EKS)**. It is a learning project, not a production system. Favor clarity and simplicity over completeness.

Three Node.js/TypeScript services form a pipeline. Distributed tracing (OpenTelemetry -> Tempo) shows how long a request takes from defender to attacker. Prometheus scrapes request metrics from every service.

```
app-defender --HTTP--> app-midfielder --HTTP--> app-attacker
   (generates dummy data)  (simulated slow work)    (simulated work, end of pipeline)
        \_____________________ traces (OTLP) ______________________/
                                   v
                                 Tempo --> Grafana (view traces)

each service --GET /metrics--> Prometheus --> Grafana (view metrics)
```

| Service | Role |
|---|---|
| `app-defender` | Generates dummy data and POSTs it to `app-midfielder` in a continuous loop, starting at boot. Starts each trace. |
| `app-midfielder` | Receives data, simulates slow processing (random delay), POSTs to `app-attacker`. |
| `app-attacker` | Receives data, simulates processing, finishes the pipeline. |

## Tech stack

- **Language/runtime:** TypeScript on Node.js (LTS)
- **HTTP:** Express. Service-to-service calls use plain HTTP/REST (built-in `fetch`).
- **Packages:** npm. Each service is an independent npm package (no workspaces, no shared package; small duplication is acceptable).
- **Tracing:** OpenTelemetry Node SDK with auto-instrumentation, exporting OTLP to Tempo. Trace context propagates automatically through HTTP headers. Do not add manual spans unless asked.
- **Metrics:** `prom-client` in each service exposes `GET /metrics`; Prometheus scrapes it (pull model). Metrics: `requests_completed_total` (counter) and `request_duration_seconds` (histogram), labelled `method`, `route`, `status`. Midfielder/attacker record them in the `recordRequestMetrics` middleware; the defender has no inbound traffic, so it records its outgoing sends in `runPipeline`.
- **Local run:** Docker Compose (apps + Tempo + Prometheus + Grafana)
- **Cloud:** Terraform provisions AWS infra (VPC, EKS cluster, node group, etc.). Images are published to Docker Hub (`leonardiwagner/das-fussball-<app>`). Kubernetes resources are plain YAML applied with `kubectl`. Tempo and Grafana are installed on the cluster with Helm.

## Repository layout

```
.
├── AGENTS.md
├── docker-compose.yml
├── release.sh            # bump version, build + push images to Docker Hub
├── apps/
│   ├── app-defender/
│   ├── app-midfielder/
│   └── app-attacker/
├── observability/        # Tempo + Prometheus config, Grafana datasource + dashboard provisioning
├── k8s/                  # Plain Kubernetes manifests (Deployment, Service, ...)
└── terraform/            # AWS / EKS infrastructure
```

### Service internal layout (same in every service)

Folders represent layers. Each file has **one responsibility**.

```
apps/app-<name>/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # Entry point: load tracing, start server. Nothing else.
    ├── tracing.ts        # OpenTelemetry setup (must be imported first)
    ├── metrics.ts        # Prometheus metric definitions (counter, histogram)
    ├── config/           # Env var reading (ports, downstream URLs, delays)
    ├── routes/           # Express routers: HTTP in/out only, no business logic
    ├── services/         # Business logic (generate data, simulate processing)
    ├── clients/          # Outgoing HTTP calls to the next service
    └── models/           # TypeScript types/interfaces
```

Dependencies flow one way: `routes -> services -> clients`. `models` and `config` can be used by any layer. Never import upward (e.g. `services` must not import from `routes`).

## Coding rules

The guiding principle: **as simple and short as possible, yet well organized.**

- Keep functions small and single-purpose (aim for under ~15 lines).
- Keep files small, with one responsibility each. If a file does two things, split it. Do not create catch-all files such as `utils.ts` or `helpers.ts`.
- Name files and functions after what they do (`simulateProcessing.ts`, `sendToAttacker.ts`).
- Prefer the standard library and built-ins (`fetch`, `setTimeout`) over new dependencies. Justify any new dependency.
- No abstractions "for the future": no dependency injection frameworks, base classes, design patterns, or generic layers.
- No database, auth, queues, or retries. Keep error handling minimal: return 500 and log a short message.
- Config comes from environment variables with sensible defaults, read only in `config/`.
- Comments only where the *why* is not obvious. The code should read clearly on its own. Since this is a teaching repo, short comments on Kubernetes/Terraform/OTel concepts in YAML and `.tf` files are welcome.
- TypeScript `strict` mode on. Avoid `any`.
- Do not add a test framework, linters, or CI unless asked.

## Conventions

- **Ports:** defender `3001`, midfielder `3002`, attacker `3003`, Tempo OTLP HTTP `4318`, Tempo query `3200`, Grafana `3000`, Prometheus `9090` (published on host port `9091` in Docker Compose).
- **Endpoints:** each service exposes `GET /health` (used for Kubernetes probes) and `GET /metrics` (Prometheus scrape target). Midfielder and attacker expose `POST /process`. Defender has no trigger endpoint: it starts sending data in a loop as soon as it boots.
- **Env vars (per service):**
  - `PORT`
  - `NEXT_SERVICE_URL` (midfielder and defender: the downstream service)
  - `OTEL_SERVICE_NAME` (e.g. `app-defender`)
  - `OTEL_EXPORTER_OTLP_ENDPOINT` (e.g. `http://tempo:4318`)
  - `PROCESSING_DELAY_MS` (simulated work time)
- **Service discovery:** use service names as hostnames (`http://app-midfielder:3002`). This works the same in Docker Compose and in Kubernetes Services.
- **Docker images:** small multi-stage builds on a Node LTS alpine image, running compiled JS from `dist/`. Published as `leonardiwagner/das-fussball-<app>:<version>` (+ `latest`), all apps sharing one version, built for `linux/amd64` (standard EKS nodes).
- **Kubernetes:** one Deployment and one ClusterIP Service per app, with resource requests/limits and `/health` probes. Only `app-defender` needs external access.
- **Terraform:** keep it flat and readable: few files (`main.tf`, `variables.tf`, `outputs.tf`), no modules unless needed. Never commit state files or `*.tfvars` with secrets.

## Commands

Run from the repository root unless noted.

```bash
# Local: build and start everything (apps, Tempo, Grafana)
docker compose up --build

# The defender starts the pipeline on boot; open Grafana at http://localhost:3000 > Explore > Tempo (traces) or Prometheus (metrics)
# Prometheus UI: http://localhost:9091
# Dashboards (provisioned from observability/grafana/dashboards/): Service Overview (RED), Pipeline Comparison, Traces, Metrics to Traces

# Single service (from apps/app-<name>/)
npm install
npm run dev      # run with tsx / ts-node watch
npm run build    # compile TypeScript to dist/
npm start        # run compiled output

# Release: bump all apps' version, build linux/amd64 images, push to Docker Hub, commit + tag
# (needs `docker login -u leonardiwagner` first; use an access token)
./release.sh patch   # or minor | major

# AWS
cd terraform && terraform init && terraform plan && terraform apply
kubectl apply -f k8s/
```

Every service's `package.json` must provide the `dev`, `build`, and `start` scripts above.

## Boundaries for agents

**Always**
- Keep the three apps structurally identical so learners can compare them.
- Update `docker-compose.yml`, `k8s/`, and this file when ports, env vars, or endpoints change.
- Verify the stack still starts with `docker compose up --build` after changes to apps or compose files.

**Ask first**
- Adding a dependency, framework, or new top-level folder.
- Changing the transport (e.g. to gRPC or Pub/Sub) or the observability stack.
- Anything that creates billable AWS resources or runs `terraform apply` / `terraform destroy`.

**Never**
- Commit secrets, service account keys, `.env` files, or Terraform state.
- Run `terraform apply`, `terraform destroy`, or `kubectl delete` against a real cluster without explicit user approval.
- Add production-grade complexity (service mesh, autoscaling, auth, databases) unless asked.
