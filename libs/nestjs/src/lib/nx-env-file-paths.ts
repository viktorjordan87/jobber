import { join } from 'node:path';

/** `.env` in cwd (e.g. `apps/<name>` when you start the app from there) or monorepo root + `apps/<name>/.env`. */
export function nxAppEnvFilePaths(appName: string): string[] {
  const cwd = process.cwd();
  return [join(cwd, '.env'), join(cwd, 'apps', appName, '.env')];
}
