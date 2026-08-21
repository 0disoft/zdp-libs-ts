import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const packageRoot = join(repositoryRoot, '.tmp', 'package-check');

const MAX_PACKED_BYTES = 1024 * 1024;
const MAX_UNPACKED_BYTES = 4 * 1024 * 1024;
const MAX_ENTRY_COUNT = 1024;
const MAX_SINGLE_FILE_BYTES = 512 * 1024;

const PUBLIC_MODULES = [
  'schema',
  'env-contract',
  'event-contracts',
  'error',
  'i18n-contract',
  'glossary-contract',
  'calculator-engine'
] as const;

const ROOT_FILES = new Set([
  'package.json',
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'BOUNDARY.md',
  'RUNBOOK.md',
  'service.yaml',
  'SECURITY.md',
  'LICENSE'
]);

const DIST_SUFFIXES = ['.js', '.js.map', '.d.ts', '.d.ts.map'] as const;

interface PackageManifest {
  readonly name: string;
  readonly version: string;
}

interface PackedFile {
  readonly path: string;
  readonly size: number;
}

interface PackedPackage {
  readonly name: string;
  readonly version: string;
  readonly filename: string;
  readonly size: number;
  readonly unpackedSize: number;
  readonly entryCount: number;
  readonly files: readonly PackedFile[];
}

await rm(packageRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });

try {
  const manifest = parseManifest(
    JSON.parse(await readFile(join(repositoryRoot, 'package.json'), 'utf8')) as unknown
  );
  const packed = await createPackageArtifact();
  const diagnostics = validatePackedPackage(manifest, packed);

  if (diagnostics.length > 0) {
    throw new Error(
      ['Packed package policy failed.', ...diagnostics.map((item) => `- ${item}`)].join(
        '\n'
      )
    );
  }

  console.log(
    [
      `Packed package policy passed for ${packed.name}@${packed.version}.`,
      `Artifact: ${packed.filename}`,
      `Entries: ${packed.entryCount}/${MAX_ENTRY_COUNT}`,
      `Packed bytes: ${packed.size}/${MAX_PACKED_BYTES}`,
      `Unpacked bytes: ${packed.unpackedSize}/${MAX_UNPACKED_BYTES}`
    ].join('\n')
  );
} finally {
  await rm(packageRoot, { recursive: true, force: true });
}

async function createPackageArtifact(): Promise<PackedPackage> {
  const processHandle = Bun.spawn(
    [
      npmCommand(),
      'pack',
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      packageRoot
    ],
    {
      cwd: repositoryRoot,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe'
    }
  );
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(processHandle.stdout).text(),
    new Response(processHandle.stderr).text(),
    processHandle.exited
  ]);

  if (exitCode !== 0) {
    throw new Error(
      [`npm pack failed with exit code ${exitCode}.`, stderr.trim()]
        .filter((line) => line.length > 0)
        .join('\n')
    );
  }

  return parsePackOutput(JSON.parse(stdout) as unknown);
}

function validatePackedPackage(
  manifest: PackageManifest,
  packed: PackedPackage
): readonly string[] {
  const diagnostics: string[] = [];

  if (packed.name !== manifest.name) {
    diagnostics.push(
      `package name mismatch: manifest=${manifest.name}, tarball=${packed.name}`
    );
  }
  if (packed.version !== manifest.version) {
    diagnostics.push(
      `package version mismatch: manifest=${manifest.version}, tarball=${packed.version}`
    );
  }
  if (packed.size > MAX_PACKED_BYTES) {
    diagnostics.push(
      `packed size ${packed.size} exceeds ${MAX_PACKED_BYTES} bytes`
    );
  }
  if (packed.unpackedSize > MAX_UNPACKED_BYTES) {
    diagnostics.push(
      `unpacked size ${packed.unpackedSize} exceeds ${MAX_UNPACKED_BYTES} bytes`
    );
  }
  if (packed.entryCount !== packed.files.length) {
    diagnostics.push(
      `entry count mismatch: metadata=${packed.entryCount}, files=${packed.files.length}`
    );
  }
  if (packed.entryCount > MAX_ENTRY_COUNT) {
    diagnostics.push(
      `entry count ${packed.entryCount} exceeds ${MAX_ENTRY_COUNT}`
    );
  }

  const paths = new Set<string>();
  for (const file of packed.files) {
    const path = normalizePackagePath(file.path);
    if (paths.has(path)) {
      diagnostics.push(`duplicate package path: ${path}`);
      continue;
    }
    paths.add(path);

    if (!isAllowedPackagePath(path)) {
      diagnostics.push(`unexpected package path: ${path}`);
    }
    if (file.size > MAX_SINGLE_FILE_BYTES) {
      diagnostics.push(
        `single file ${path} is ${file.size} bytes, above ${MAX_SINGLE_FILE_BYTES}`
      );
    }
  }

  for (const requiredPath of requiredPackagePaths()) {
    if (!paths.has(requiredPath)) {
      diagnostics.push(`required package path is missing: ${requiredPath}`);
    }
  }

  return diagnostics;
}

function isAllowedPackagePath(path: string): boolean {
  if (ROOT_FILES.has(path)) {
    return true;
  }
  if (/^contracts\/[A-Za-z0-9._/-]+\.ya?ml$/.test(path)) {
    return true;
  }
  if (/^glossary\/[A-Za-z0-9._/-]+\.ya?ml$/.test(path)) {
    return true;
  }
  if (DIST_SUFFIXES.some((suffix) => path === `dist/index${suffix}`)) {
    return true;
  }
  if (
    PUBLIC_MODULES.some((moduleName) =>
      DIST_SUFFIXES.some(
        (suffix) => path === `dist/${moduleName}/index${suffix}`
      )
    )
  ) {
    return true;
  }
  if (
    /^dist\/calculator-engine\/[A-Za-z0-9._/-]+$/.test(path) &&
    DIST_SUFFIXES.some((suffix) => path.endsWith(suffix))
  ) {
    return true;
  }
  return DIST_SUFFIXES.some(
    (suffix) => path === `dist/internal/record${suffix}`
  );
}

function requiredPackagePaths(): readonly string[] {
  return [
    'package.json',
    'README.md',
    'LICENSE',
    'dist/index.js',
    'dist/index.d.ts',
    ...PUBLIC_MODULES.flatMap((moduleName) => [
      `dist/${moduleName}/index.js`,
      `dist/${moduleName}/index.d.ts`
    ]),
    'dist/internal/record.js'
  ];
}

function normalizePackagePath(path: string): string {
  const normalized = path.replaceAll('\\', '/');
  if (
    normalized.startsWith('/') ||
    normalized.includes('/../') ||
    normalized.startsWith('../') ||
    normalized.includes('//')
  ) {
    throw new Error(`npm pack returned a non-canonical path: ${path}`);
  }
  return normalized;
}

function parseManifest(value: unknown): PackageManifest {
  const record = asRecord(value, 'package.json');
  return {
    name: readString(record, 'name', 'package.json.name'),
    version: readString(record, 'version', 'package.json.version')
  };
}

function parsePackOutput(value: unknown): PackedPackage {
  if (!Array.isArray(value) || value.length !== 1) {
    throw new Error('npm pack --json must return exactly one package result.');
  }
  const record = asRecord(value[0], 'npm pack result');
  const files = record.files;
  if (!Array.isArray(files)) {
    throw new Error('npm pack result.files must be an array.');
  }

  return {
    name: readString(record, 'name', 'npm pack result.name'),
    version: readString(record, 'version', 'npm pack result.version'),
    filename: readString(record, 'filename', 'npm pack result.filename'),
    size: readNonNegativeInteger(record, 'size', 'npm pack result.size'),
    unpackedSize: readNonNegativeInteger(
      record,
      'unpackedSize',
      'npm pack result.unpackedSize'
    ),
    entryCount: readNonNegativeInteger(
      record,
      'entryCount',
      'npm pack result.entryCount'
    ),
    files: files.map((item, index) => {
      const file = asRecord(item, `npm pack result.files[${index}]`);
      return {
        path: readString(
          file,
          'path',
          `npm pack result.files[${index}].path`
        ),
        size: readNonNegativeInteger(
          file,
          'size',
          `npm pack result.files[${index}].size`
        )
      };
    })
  };
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}: expected object.`);
  }
  return value as Record<string, unknown>;
}

function readString(
  record: Record<string, unknown>,
  key: string,
  path: string
): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path}: expected non-empty string.`);
  }
  return value;
}

function readNonNegativeInteger(
  record: Record<string, unknown>,
  key: string,
  path: string
): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`${path}: expected non-negative integer.`);
  }
  return value;
}

function npmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}
