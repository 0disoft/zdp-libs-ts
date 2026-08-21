import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageConsumerSmokeSource } from './package-consumer-smoke.js';

interface PackageManifest {
  readonly version: string;
}

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const smokeRoot = join(repositoryRoot, '.tmp', 'package-smoke');
const packageRoot = join(smokeRoot, 'package');
const consumerRoot = join(smokeRoot, 'consumer');
const manifest = parseManifest(
  JSON.parse(await readFile(join(repositoryRoot, 'package.json'), 'utf8')) as unknown
);

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });

try {
  await run(
    npmCommand(),
    [
      'pack',
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      packageRoot
    ],
    repositoryRoot
  );

  const tarballs = (await readdir(packageRoot)).filter((file) =>
    file.endsWith('.tgz')
  );
  if (tarballs.length !== 1 || tarballs[0] === undefined) {
    throw new Error(
      `Expected exactly one package tarball, found ${tarballs.length}.`
    );
  }

  await mkdir(consumerRoot, { recursive: true });
  await writeFile(
    join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      { name: 'zdp-libs-ts-smoke', private: true, type: 'module' },
      null,
      2
    )}\n`,
    'utf8'
  );
  await writeFile(
    join(consumerRoot, 'smoke.mjs'),
    packageConsumerSmokeSource(),
    'utf8'
  );

  const tarball = join(packageRoot, tarballs[0]);
  await run(
    npmCommand(),
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      tarball
    ],
    consumerRoot
  );
  await run('node', ['smoke.mjs', manifest.version], consumerRoot);
} finally {
  await rm(smokeRoot, { recursive: true, force: true });
}

function parseManifest(value: unknown): PackageManifest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('package.json must contain an object.');
  }
  const version = (value as Record<string, unknown>).version;
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error('package.json.version must be a non-empty string.');
  }
  return { version };
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
