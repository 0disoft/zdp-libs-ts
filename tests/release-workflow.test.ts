import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const workflowPath = fileURLToPath(
  new URL('../.github/workflows/release.yml', import.meta.url)
);
const workflow = await readFile(workflowPath, 'utf8');
const ciWorkflow = await readFile(
  fileURLToPath(new URL('../.github/workflows/ci.yml', import.meta.url)),
  'utf8'
);

function jobSource(jobName: string): string {
  const marker = `  ${jobName}:\n`;
  const start = workflow.indexOf(marker);
  if (start < 0) {
    throw new Error(`Missing release workflow job: ${jobName}.`);
  }
  const remaining = workflow.slice(start + marker.length);
  const nextJob = remaining.search(/^  [a-z][a-z-]*:\n/m);
  return nextJob < 0 ? remaining : remaining.slice(0, nextJob);
}

describe('npm release workflow privilege boundary', () => {
  test('keeps the workflow valid YAML', () => {
    expect(() => Bun.YAML.parse(workflow)).not.toThrow();
  });

  test('grants OIDC only to the artifact-only publish job', () => {
    const verify = jobSource('verify');
    const publish = jobSource('publish');
    const verifyPublished = jobSource('verify-published');

    expect(workflow.match(/id-token: write/g)).toHaveLength(1);
    expect(verify).not.toContain('id-token: write');
    expect(verifyPublished).not.toContain('id-token: write');
    expect(publish).toContain('id-token: write');

    for (const forbidden of [
      'actions/checkout@',
      'oven-sh/setup-bun@',
      'bun install',
      'bun run',
      'npm pack'
    ]) {
      expect(publish).not.toContain(forbidden);
    }
  });

  test('publishes only the downloaded digest-verified tarball', () => {
    const verify = jobSource('verify');
    const publish = jobSource('publish');

    expect(verify).toContain(
      'actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a'
    );
    expect(publish).toContain(
      'actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c'
    );
    expect(publish).toContain('Downloaded release artifact digest does not match');
    expect(publish).toContain(
      'npm publish "release-artifact/${TARBALL_NAME}" --access public --provenance --ignore-scripts'
    );
  });
});

describe('CI workflow structure', () => {
  test('declares each top-level job exactly once', () => {
    const jobsStart = ciWorkflow.indexOf('\njobs:\n');
    expect(jobsStart).toBeGreaterThanOrEqual(0);
    const jobsSource = ciWorkflow.slice(jobsStart + '\njobs:\n'.length);
    const jobNames = [...jobsSource.matchAll(/^  ([a-z][a-z-]*):\n/gm)].map(
      (match) => match[1]
    );
    expect(jobNames).toEqual([
      'check',
      'package',
      'api-contract-integration'
    ]);
    expect(new Set(jobNames).size).toBe(jobNames.length);
  });
});
