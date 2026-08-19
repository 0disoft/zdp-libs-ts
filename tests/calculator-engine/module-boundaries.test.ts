import { expect, it } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CALCULATOR_IDS } from './calculator-ids';

it('keeps the public entrypoint as a barrel', () => {
  const source = readFileSync(
    join(process.cwd(), 'src', 'calculator-engine', 'index.ts'),
    'utf8'
  );
  expect(source).not.toContain('function calculate');
  expect(source).not.toContain('BigInt(');
  expect(source).toContain("export * from './calculators/index.js';");
});

it('keeps one implementation module per reviewed calculator', () => {
  const calculatorFiles = readdirSync(
    join(process.cwd(), 'src', 'calculator-engine', 'calculators')
  )
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .map((file) => file.slice(0, -3))
    .sort();

  expect(calculatorFiles).toEqual([...CALCULATOR_IDS].sort());
});
