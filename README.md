# Jobber

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/nest?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve auth
```

To create a production bundle:

```sh
npx nx build auth
```

To see all available targets to run for a project, run:

```sh
npx nx show project auth
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/nest:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Kubernetes (Helm cheat sheet)

Run these from the **repository root**. The chart lives at `charts/jobber/`.

### After a Windows restart (resume where you left off)

A reboot stops Minikube and closes any **port-forward** terminals. Your Helm release and workloads usually stay on the Minikube disk (unless you removed the cluster or profile).

1. **Start the cluster**

   ```bash
   minikube start
   ```

   If you use another profile: `minikube start -p <your-profile>`.

2. **Point `kubectl` at Minikube and sanity-check**

   ```bash
   kubectl config use-context minikube
   kubectl get nodes
   kubectl get pods -n jobber
   ```

   If `use-context` errors because the context name differs, run `kubectl config get-contexts` and pick the row for your Minikube cluster.

3. **Confirm the Helm release is still there**

   ```bash
   helm list -n jobber
   ```

   You should see release **`jobber`**. If the list is empty, reinstall from the repo root:

   ```bash
   helm upgrade --install jobber ./charts/jobber -n jobber --create-namespace
   ```

4. **Open tunnels again** — `kubectl port-forward` does not survive a restart. Start the forwards you need again (same commands as in **Local testing** below); each command in its **own** terminal.

   On Windows with the Docker driver, if you use **`minikube service`** or LoadBalancer URLs, you may need **`minikube tunnel`** in a separate terminal while you work.

### Before you deploy

- **Cluster running:** If you use Minikube, start it first: `minikube start`. Then confirm: `kubectl get nodes`.
- **Context:** You should be on the cluster you mean (often `minikube`): `kubectl config current-context`.

### Install

Creates the `jobber` namespace if it does not exist and installs the release named `jobber`:

```bash
helm install jobber ./charts/jobber -n jobber --create-namespace
```

Idempotent install or upgrade from the repo root:

```bash
helm upgrade --install jobber ./charts/jobber -n jobber --create-namespace
```

### After install — quick checks

```bash
kubectl get pods -n jobber
kubectl get deployments -n jobber
kubectl logs -n jobber -l app=jobs --tail=50
```

### Ingress, `jobber.local`, and Minikube tunnel (beginner guide)

If Kubernetes is new, this section explains **what the Ingress is**, how **`jobber.local`** fits in, and why **`minikube tunnel`** shows up in tutorials.

#### The mental model (one request)

1. Your machine runs **`curl`** or a browser and uses a **host name** (`jobber.local`).
2. The OS turns that name into an **IP address** (via DNS or your **`hosts`** file).
3. Something on that IP must accept **HTTP** (usually port **80** or **443**). That “something” is often the **ingress-nginx** controller inside Minikube.
4. The controller looks at the **Host** header (`jobber.local`) and the **path** (`/jobs`, `/auth`, …) and forwards the request to the right **Kubernetes Service** (for example `auth-http`), which reaches the **Pods**.

So: **Ingress = HTTP routing rules** at the edge of the cluster. It does **not** run your app code; it **dispatches** traffic to Services.

#### What this repo’s Ingress does

The chart defines a single Ingress (`charts/jobber/templates/ingress.yaml`):

- **Host:** `jobber.local` — the controller only matches traffic that declares this host (browser/`curl` do that automatically when you open `http://jobber.local/...`).
- **Ingress class:** `nginx` — handled by the **ingress-nginx** controller (installed separately, often in namespace `ingress-nginx`).
- **Paths (prefix match):**
  - **`/jobs`** → Service **`jobs-http`** on the HTTP port from `values.yaml` (`jobs.port.http`).
  - **`/auth`** → Service **`auth-http`** on `auth.port.http`.

If a path’s Service does not exist, the Ingress can still “work” at the edge but you get **502** or similar for that path. Check backends with:

```bash
kubectl describe ing ingress -n jobber
```

#### Why `kubectl get ing` shows an `ADDRESS` (or nothing at first)

The **`ADDRESS`** column is **not** something you set in YAML. The **ingress controller** writes **status** on the Ingress after it syncs the object. It may be **empty for a short time** right after install, then fill in (for example with your Minikube node IP).

On **Minikube**, that address is often the **node’s internal IP** (for example `192.168.49.2`). That is “where the cluster lives” from the hypervisor’s point of view, not necessarily `127.0.0.1` on Windows.

#### `jobber.local` and your Windows `hosts` file

`jobber.local` is **not** registered on the public internet. For your PC to resolve it, add a line to:

`C:\Windows\System32\drivers\etc\hosts`

Typical patterns:

- **`127.0.0.1 jobber.local`** — use when **something on your machine** is listening on **localhost** and forwarding into the cluster (see **`minikube tunnel`** below). Matches how many guides set up **LoadBalancer**-style access on Minikube.
- **`192.168.49.2 jobber.local`** (example) — point the name at the **Minikube node IP** if you reach the ingress via that IP (for example **NodePort** without tunnel). The exact IP comes from `kubectl get nodes -o wide`.

**Mismatch symptom:** `ping jobber.local` works but the browser shows **connection refused** — the name resolves, but nothing is listening on the IP/port you are using.

#### What `minikube tunnel` is and why it must stay running

**Minikube** runs Kubernetes **inside a VM** (or similar). Cluster IPs and node IPs are **not** the same as `127.0.0.1` on Windows unless you bridge them.

**`minikube tunnel`** (run in its **own** terminal, **as Administrator** on Windows when Minikube asks for it) creates a **network path** so that **LoadBalancer** Services (and related routing) can be reached from the host more like a “real” cloud load balancer. While the tunnel runs, using **`127.0.0.1`** in `hosts` for `jobber.local` can line up with how HTTP is exposed—**but the tunnel process must keep running**. Closing that terminal stops the tunnel.

Minikube may warn about **ports below 1024 on Windows** with older OpenSSH; see the [Minikube accessing docs](https://minikube.sigs.k8s.io/docs/handbook/accessing/) if port 80 behaves oddly.

#### Quick checks from Windows

Use **`curl.exe`** in PowerShell (not `curl`, which is an alias for `Invoke-WebRequest`):

```powershell
curl.exe -v http://jobber.local/auth/graphql
curl.exe -v http://jobber.local/jobs/graphql
```

Adjust paths if your apps only expose certain routes. If you use **HTTPS** locally with a dev certificate, you may need **`curl.exe -vk`**.

#### Ingress vs `kubectl port-forward`

- **Ingress:** one front door by **host name + path**; good match for “realistic” HTTP and multiple apps.
- **`port-forward`:** directly maps a **Service** port to `127.0.0.1` on your machine; no DNS/`hosts` needed. See **Local testing (`kubectl port-forward`)** below.

You can use either; they solve the same “how do I hit the cluster from my laptop?” problem in different ways.

### Local testing (`kubectl port-forward`)

Workloads use **ClusterIP** Services, so nothing listens on your machine until you forward a port. Run each command in its **own terminal** and leave it open while you test.

| App          | Command                                                        | Then open (examples)                                                                                     |
| --------------| ----------------------------------------------------------------| ----------------------------------------------------------------------------------------------------------|
| **jobs**     | `kubectl port-forward -n jobber svc/jobs-http 3001:3001`        | GraphiQL: `http://127.0.0.1:3001/graphiql` · GraphQL HTTP: `POST http://127.0.0.1:3001/graphql`          |
| **auth**     | `kubectl port-forward -n jobber svc/auth-http 3000:3000`       | Same paths on port **3000** (`/graphiql`, `/graphql`). The Service is named **`auth-http`**, not `auth`. |
| **executor** | `kubectl port-forward -n jobber deployment/executor 3002:3002` | HTTP on **3002** (this chart has no `Service` for executor; forward the **Deployment** instead).         |

**Notes:** Ports match `charts/jobber/values.yaml` (`jobs.port`, `auth.port.http`, `executor.port`). Mercurius GraphiQL is at **`/graphiql`**, not under `/api`. Alternatively you can use `minikube service <svc-name> -n jobber` (Docker driver on Windows often needs the tunnel process to stay running).

### Change config and redeploy

Edit `charts/jobber/values.yaml`, then upgrade the same release:

```bash
helm upgrade jobber ./charts/jobber -n jobber
```

See what would change without applying:

```bash
helm diff upgrade jobber ./charts/jobber -n jobber   # needs helm-diff plugin
# or
helm upgrade jobber ./charts/jobber -n jobber --dry-run
```

### Remove the release

```bash
helm uninstall jobber -n jobber
```

### If Helm says the cluster is unreachable

The API server is not listening (cluster stopped or wrong kubeconfig). Start Minikube again (`minikube start`) or fix `kubectl config use-context`.

### Images (Minikube + private registries)

If pods show **ImagePullBackOff**, the cluster cannot pull the container image (for example ECR). You need registry credentials, `imagePullSecrets`, or a local image loaded into Minikube (`minikube image load ...`).

### Chart dependencies (Pulsar / PostgreSQL)

After changing `charts/jobber/Chart.yaml` dependencies, refresh the downloaded charts:

```bash
cd charts/jobber
helm repo add apachepulsar https://pulsar.apache.org/charts   # once per machine
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm dependency update .
```

Notes:

- The Apache Pulsar Helm index lives at **`https://pulsar.apache.org/charts`** (a `.../helm/charts` URL returns 404).
- Bitnami’s chart is named **`postgresql`** in `Chart.yaml`; overrides in `values.yaml` sit under the **`postgresql:`** key.

### Where are Pulsar and PostgreSQL?

With `helm install ... -n jobber`, **subcharts deploy into that release namespace** (`jobber`) by default. You will not see separate top-level namespaces named `pulsar` or `postgresql` unless you configure overrides and create those namespaces yourself. List workloads with:

```bash
kubectl get pods -n jobber
kubectl get statefulsets,deployments,services -n jobber
```

### Troubleshooting Helm (local / Minikube)

- **`VMAgent`, `VMRule`, `VMNodeScrape`, … / “ensure CRDs are installed first”** — Newer Pulsar chart versions enable **`victoria-metrics-k8s-stack`** by default. That stack needs VictoriaMetrics **operator CRDs** on the cluster. This workspace turns that stack **off** in `charts/jobber/values.yaml` for clusters that do not have those CRDs. Enable it only if you install the operator and CRDs first.
- **Namespace “exists and cannot be imported” / missing `app.kubernetes.io/managed-by: Helm`** — Prefer **`helm ... -n jobber --create-namespace`** and keep **`pulsar.namespaceCreate: false`** in `values.yaml` so Helm owns namespace labels; letting the Pulsar subchart create the namespace can break strict Helm upgrades.
- **PowerShell** — Use **`helm`** (the Helm CLI), not **`help`** (that is `Get-Help`, not Helm).
- **Broker `Init:Error` / `wait-bookkeeper-ready` looping** — The broker init waits until DNS returns at least **`managedLedgerDefaultEnsembleSize`** bookies (chart default **2**). With **`bookkeeper.replicaCount: 1`** (typical on Minikube), set **`pulsar.broker.configData`** `managedLedgerDefaultEnsembleSize`, `managedLedgerDefaultWriteQuorum`, and `managedLedgerDefaultAckQuorum` to **`"1"`** (see `charts/jobber/values.yaml`). After changing that, **`kubectl delete pod jobber-pulsar-broker-0 -n jobber`** so the StatefulSet recreates the pod with the new init script.

## Kubernetes: `kubectl` for daily development

These examples use namespace **`jobber`** (where this chart installs). They work on Minikube or any cluster where you deployed the release. On **Windows PowerShell**, the commands are the same; use **Ctrl+C** to stop `port-forward` or `get pods -w`.

### Concepts (quick)

| Idea | What it means |
|------|----------------|
| **Namespace** | `-n jobber` limits commands to this stack (apps + Pulsar + PostgreSQL). |
| **Pod** | Ephemeral; the controller usually replaces it. Prefer **labels** (`-l app=jobs`) or **resource names** (`deployment/executor`) instead of hard-coding one pod name. |
| **Deployment** | Manages stateless app pods (auth, jobs, executor, …). |
| **StatefulSet** | Ordered pods with stable names (e.g. `jobber-postgresql-0`, Pulsar components). |

### Cluster and context

```bash
kubectl config current-context
kubectl config get-contexts
kubectl cluster-info
kubectl get nodes
```

Point at Minikube after a restart: `kubectl config use-context minikube` (or the name from `get-contexts`).

### List resources

```bash
kubectl get pods -n jobber
kubectl get deployments,statefulsets,services -n jobber
kubectl get pvc -n jobber
```

**PersistentVolumes** are cluster-scoped (no namespace):

```bash
kubectl get pv
```

Watch pods until something changes (stop with **Ctrl+C**):

```bash
kubectl get pods -n jobber -w
```

### Describe and events (why is this pod failing?)

Replace `<pod>` with a name from `kubectl get pods -n jobber`.

```bash
kubectl describe pod <pod> -n jobber
kubectl get events -n jobber --sort-by='.lastTimestamp'
```

### Logs

By pod name:

```bash
kubectl logs <pod> -n jobber --tail=100
kubectl logs <pod> -n jobber -f
```

If the container restarted, previous run’s logs:

```bash
kubectl logs <pod> -n jobber --previous --tail=100
```

By label (matches how this chart labels apps):

```bash
kubectl logs -n jobber -l app=jobs --tail=50
kubectl logs -n jobber -l app=auth --tail=50
kubectl logs -n jobber -l app=executor --tail=50
kubectl logs -n jobber -l app=products --tail=50
```

### Shell inside a pod (`exec`)

```bash
kubectl exec --stdin --tty <pod> -n jobber -- sh
```

**Pulsar broker** (to run `pulsar-admin`; from repo image, binaries are under `/pulsar`):

```bash
kubectl exec --stdin --tty jobber-pulsar-broker-0 -n jobber -- sh
# inside the pod:
cd /pulsar/bin
./pulsar-admin topics stats persistent://public/default/fibonacci
```

### Port-forward (summary)

See **Local testing (`kubectl port-forward`)** above for auth, jobs, and executor. **Products** HTTP is not exposed as a separate `Service` in this chart; forward the deployment:

```bash
kubectl port-forward -n jobber deployment/products 3003:3003
```

gRPC for products uses service `products` and port **5001** in `values.yaml` if you need it from your host.

### Restart workloads (new image / pick up ConfigMap)

Rollout restart is a safe way to recreate pods without editing Helm:

```bash
kubectl rollout restart deployment/auth -n jobber
kubectl rollout restart deployment/jobs -n jobber
kubectl rollout restart deployment/executor -n jobber
kubectl rollout restart deployment/products -n jobber
```

Restart everything that is a Deployment in one go:

```bash
kubectl rollout restart deployment -n jobber
```

Watch status:

```bash
kubectl rollout status deployment/jobs -n jobber
```

### Scale replicas

```bash
kubectl scale deployment executor -n jobber --replicas=0
kubectl scale deployment executor -n jobber --replicas=1
```

**Helm note:** If you later see upgrade errors about **conflicts on `.spec.replicas`**, something (often `kubectl scale`) last changed replicas and Helm’s server-side apply disagrees. Fix by aligning replicas in **`values.yaml`** + `helm upgrade`, or temporarily `kubectl delete deployment <name> -n jobber` and let Helm recreate it on the next upgrade.

### Delete pods (force reschedule / pull image again)

```bash
kubectl delete pod -l app=executor -n jobber
```

Kubernetes will create new pods to match the Deployment (new pull if `imagePullPolicy: Always`).

### PostgreSQL: connect from your shell (`psql`)

The Bitnami PostgreSQL instance is reachable in-cluster as **`jobber-postgresql`** on port **5432**. Default credentials in `charts/jobber/values.yaml` are user **`postgres`** / password **`postgres`** (change these for anything beyond local dev).

Apps use separate databases: **`jobber`**, **`products`**, and **`jobs`** (created by the chart init script). If you changed `postgresql.auth` or per-app users in `values.yaml`, use those instead.

#### Already inside the pod? (`sh-5.2$` or similar)

If you opened a shell with:

```bash
kubectl exec --stdin --tty jobber-postgresql-0 -n jobber -- sh
```

you are on the container’s **`sh`** prompt, not inside `psql` yet. Do this next:

1. **Start `psql`** (password matches default `values.yaml`; change if you overrode it).

   **Two separate lines** — press **Enter** after the first line, then type the second. Do **not** glue them together (`postgrespsql`); the shell will mis-parse `export` and `psql` will run **without** a password (`password authentication failed`).

   ```sh
   export PGPASSWORD=postgres
   psql -U postgres -d postgres
   ```

   **Safer one-liner** (no `export`; copy as a single line):

   ```sh
   PGPASSWORD=postgres psql -U postgres -d postgres
   ```

   You should see `postgres=#` (or similar). That is the **PostgreSQL** prompt.

   **If you still get `password authentication failed`:** the running database may use a different password than your current `values.yaml`. Inside the same `sh` session, Bitnami usually exposes it — use that value for `PGPASSWORD`:

   ```sh
   printenv POSTGRES_PASSWORD
   PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres -d postgres
   ```

2. **Useful `psql` commands** (meta-commands start with `\`):

   ```text
   \l              -- list databases
   \c jobs         -- connect to the jobs database (or jobber / products)
   \dt             -- list tables in current database
   \d table_name   -- describe a table
   \q              -- quit psql (back to sh)
   ```

3. **Leave the container** after `\q`: type `exit` (or press **Ctrl+D**) at the `sh` prompt.

If `psql` is not found (rare on Bitnami images), try the full path:

```sh
/opt/bitnami/postgresql/bin/psql -U postgres -d postgres
```

(and set `PGPASSWORD` the same way as above).

#### Option A — `psql` inside the database pod (no local Postgres client needed)

```bash
kubectl exec -it jobber-postgresql-0 -n jobber -- bash -lc 'PGPASSWORD=postgres psql -U postgres -d postgres'
```

Then run SQL, for example:

```sql
\l
\c jobs
\dt
\q
```

One-off query without an interactive session:

```bash
kubectl exec -it jobber-postgresql-0 -n jobber -- bash -lc 'PGPASSWORD=postgres psql -U postgres -d jobs -c "SELECT 1;"'
```

#### Option B — port-forward and use `psql` on your machine

In one terminal:

```bash
kubectl port-forward -n jobber svc/jobber-postgresql 5432:5432
```

In another terminal (bash):

```bash
export PGPASSWORD=postgres
psql -h 127.0.0.1 -p 5432 -U postgres -d jobs
```

On **PowerShell**:

```powershell
$env:PGPASSWORD = "postgres"
psql -h 127.0.0.1 -p 5432 -U postgres -d jobs
```

If `psql` is not installed locally, use **Option A** or install the [PostgreSQL client](https://www.postgresql.org/download/) for your OS.

#### Connection string (for tools like DBeaver, TablePlus, …)

While port-forward is running:

`postgresql://postgres:postgres@127.0.0.1:5432/jobs`

Replace database name (`jobs`, `products`, or `jobber`) and password as needed.

### PostgreSQL: wipe persistent data and start fresh

Data lives in **PersistentVolumeClaims (PVCs)**, not in the pod. Deleting only the pod does **not** wipe the database. You must scale the **StatefulSet** to **0**, delete the data PVC(s), then scale back to **1**. Use the **StatefulSet** name (`jobber-postgresql`), not the pod name (`jobber-postgresql-0`).

1. **List Postgres PVCs** (names may vary slightly with Helm release name):

   ```bash
   kubectl get pvc -n jobber
   ```

   For a single-instance release **`jobber`**, the data volume is usually **`data-jobber-postgresql-0`**. On PowerShell you can filter:

   ```powershell
   kubectl get pvc -n jobber | Select-String postgresql
   ```

2. **Stop PostgreSQL** (wait until the pod terminates, or PVC delete will fail as “in use”):

   ```bash
   kubectl get statefulset -n jobber
   kubectl scale statefulset jobber-postgresql -n jobber --replicas=0
   kubectl get pods -n jobber -w
   ```

   Stop watching with **Ctrl+C** once **`jobber-postgresql-0`** is no longer listed.

3. **Delete the data PVC(s)**:

   ```bash
   kubectl delete pvc data-jobber-postgresql-0 -n jobber
   ```

   If your chart created **extra** PostgreSQL PVCs (uncommon for default Bitnami primary), delete those too—only for this instance.

4. **Start PostgreSQL again**:

   ```bash
   kubectl scale statefulset jobber-postgresql -n jobber --replicas=1
   kubectl get pods -n jobber -w
   kubectl logs jobber-postgresql-0 -n jobber --tail=80
   ```

5. **Confirm new empty volumes**: new PVCs should show a **recent** age:

   ```bash
   kubectl get pvc -n jobber
   ```

**After a wipe:** app **init containers** (Prisma / Drizzle migrate) will recreate **schema** on the next deploy or rollout. Some migrations **seed** reference data (for example **categories** in the products app). Rows in **`products`** or other tables can also reappear if something **writes** to the API again—it does not always mean the old PVC survived.

If a **PV** is stuck in **`Released`** with reclaim policy **Retain**, delete it after the PVC is gone: `kubectl delete pv <name>` (names from `kubectl get pv`).

### Pulsar: clear backlog / pause consumers (example workflow)

Useful when debugging stuck messages; adjust topic and subscription names to match your app.

1. In application code, use an appropriate **subscription type** (e.g. **Shared**) on the Pulsar consumer if multiple instances should share work.
2. Scale consumers down so nothing is reading the subscription:

   ```bash
   kubectl scale deployment executor -n jobber --replicas=0
   ```

3. From the broker pod (`exec` as above), under `/pulsar/bin`:

   ```bash
   ./pulsar-admin namespaces clear-backlog public/default
   ```

4. Scale consumers back up:

   ```bash
   kubectl scale deployment executor -n jobber --replicas=1
   ```

To inspect or remove a subscription on a topic, use `./pulsar-admin topics subscriptions …` and the matching unsubscribe/delete subcommand (see [Pulsar admin CLI](https://pulsar.apache.org/docs/next/admin-api-tools/)).

### Validate Helm manifests (no cluster changes)

From repo root:

```bash
helm template jobber ./charts/jobber -n jobber
```

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/nest?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)