import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const mobileBundleBudget = Object.freeze({
  maximumBundleBytes: 5 * 1024 * 1024,
  maximumTotalBytes: 20 * 1024 * 1024,
});

export function evaluateMobileBundleBudget(files) {
  const bundles = files.filter((file) => /\.(?:hbc|js)$/u.test(file.path));
  const totalBytes = files.reduce((total, file) => total + file.bytes, 0);
  const oversizedBundle = bundles.find(
    (file) => file.bytes > mobileBundleBudget.maximumBundleBytes,
  );
  if (bundles.length < 1) throw new Error('Mobile export did not contain a JavaScript bundle.');
  if (oversizedBundle !== undefined) {
    throw new Error(`Mobile bundle exceeds budget: ${oversizedBundle.path}.`);
  }
  if (totalBytes > mobileBundleBudget.maximumTotalBytes) {
    throw new Error('Mobile exported assets exceed the total size budget.');
  }
  return Object.freeze({ bundleCount: bundles.length, fileCount: files.length, totalBytes });
}

async function inventory(directory, root = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await inventory(absolute, root)));
    else if (entry.isFile()) {
      files.push({ bytes: (await stat(absolute)).size, path: path.relative(root, absolute) });
    }
  }
  return files;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const exportDirectory = path.resolve('apps/mobile/dist');
  try {
    const result = evaluateMobileBundleBudget(await inventory(exportDirectory));
    process.stdout.write(
      `Mobile export is within budget: ${result.bundleCount} bundles, ${result.totalBytes} bytes total.\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
