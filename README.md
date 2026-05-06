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

### Local testing (`kubectl port-forward`)

Workloads use **ClusterIP** Services, so nothing listens on your machine until you forward a port. Run each command in its **own terminal** and leave it open while you test.

| App          | Command                                                        | Then open (examples)                                                                                     |
| --------------| ----------------------------------------------------------------| ----------------------------------------------------------------------------------------------------------|
| **jobs**     | `kubectl port-forward -n jobber svc/jobs 3001:3001`            | GraphiQL: `http://127.0.0.1:3001/graphiql` · GraphQL HTTP: `POST http://127.0.0.1:3001/graphql`          |
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

- Enter Pulsar shell: `c`
- enter bin folder: `cd bin`
- enter sh pulsar: `kubectl exec --stdin --tty jobber-pulsar-broker-0 -n jobber -- sh`
- get statistics: `./pulsar-admin topics stats persistent://public/default/fibonacci`
- get kubernetes pods: `kubectl get pods -n jobber`
- check pod logs: `kubectl logs executor-7fb6466965-2cfzn -n jobber --tail=100`
- describe: `kubectl describe pod executor-7fb6466965-2cfzn -n jobber`
- delete and repull iamge from aws ecr: `kubectl delete pod -l app=executor -n jobber`

1. And subscriptionType: "Shared" to the ts file in the pulsar client
2. Scale down executor service to 0 replicas: `kubectl scale deployment executor --replicas 0 -n jobber`
3. Clear backlog: `./pulsar-admin namespaces clear-backlog public/default`
4. Remove jobber subscription name from pulsar: `kubectl scale deployment executor --replicas=5 -n jobber`
5. Set executor replicas 5: 