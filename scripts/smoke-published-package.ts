import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageConsumerSmokeSource } from './package-consumer-smoke.js';

interface PackageManifest {
  readonly name: string;
  readonly version: string;
}

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const manifest = parseManifest(
  JSON.parse(await readFile(join(repositoryRoot, 'package.json'), 'utf8')) as unknown
);
const requestedSpec =
  readPackageSpec(process.argv.slice(2)) ?? `${manifest.name}@${manifest.version}`;
const expectedVersion = parseExpectedVersion(requestedSpec, manifest.name);
const smokeRoot = join(tmpdir(), `zdp-libs-ts-registry-smoke-${process.pid}`);

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });

try {
  await writeFile(
    join(smokeRoot, 'package.json'),
    `${JSON.stringify(
      { name: 'zdp-libs-ts-registry-smoke', private: true, type: 'module' },
      null,
      2
    )}\n`,
    'utf8'
  );
  await writeFile(
    join(smokeRoot, 'smoke.mjs'),
    packageConsumerSmokeSource(),
    'utf8'
  );

  await run(
    npmCommand(),
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--save-exact',
      requestedSpec
    ],
    smokeRoot
  );
  await run(npmCommand(), ['audit', 'signatures'], smokeRoot);
  await run('node', ['smoke.mjs', expectedVersion], smokeRoot);
} finally {
  await rm(smokeRoot, { recursive: true, force: true });
}

function parseManifest(value: unknown): PackageManifest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('package.json must contain an object.');
  }
  const record = value as Record<string, unknown>;
  if (typeof record.name !== 'string' || record.name.length === 0) {
    throw new Error('package.json.name must be a non-empty string.');
  }
  if (typeof record.version !== 'string' || record.version.length === 0) {
    throw new Error('package.json.version must be a non-empty string.');
  }
  return { name: record.name, version: record.version };
}

function readPackageSpec(args: readonly string[]): string | undefined {
  if (args.length === 0) {
    return undefined;
  }
  if (args.length !== 2 || args[0] !== '--package-spec' || args[1] === undefined) {
    throw new Error(
      'Usage: bun scripts/smoke-published-package.ts [--package-spec <name@version>]'
    );
  }
  return args[1];
}

function parseExpectedVersion(packageSpec: string, packageName: string): string {
  const prefix = `${packageName}@`;
  if (!packageSpec.startsWith(prefix)) {
    throw new Error(`Package spec must start with ${prefix}.`);
  }
  const version = packageSpec.slice(prefix.length);
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(
      `Package spec must use an exact semver version, received ${packageSpec}.`
    );
  }
  return version;
}

function npmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function run(
  command: string,
  args: readonly string[],
  cwd: string
): Promise<void> {
  const processHandle = Bun.spawn([command, ...args], {
    cwd,
    stdin: 'ignore',
    stdout: 'inherit',
    stderr: 'inherit'
  });
  const exitCode = await processHandle.exited;
  if (exitCode !== 0) {
    throw new Error(`${command} failed with exit code ${exitCode}.`);
  }
}
