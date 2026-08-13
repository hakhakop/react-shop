import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  YOOTHEME_COMPATIBILITY_REGISTRY,
  validateYoothemeCompatibilityRegistry,
  type RegistryValidationIssue,
  type YoothemeCompatibilityRegistry,
} from "@/lib/yoothemeCompatibilityRegistry";

/** Node-only CI helper. It confirms accepted fixture bytes have not drifted. */
export async function validateRegisteredFixtureFiles(
  repositoryRoot = process.cwd(),
  registry: YoothemeCompatibilityRegistry = YOOTHEME_COMPATIBILITY_REGISTRY,
): Promise<RegistryValidationIssue[]> {
  const issues = validateYoothemeCompatibilityRegistry(registry);
  for (const fixtureRecord of registry.fixtures) {
    const sourcePath = path.resolve(repositoryRoot, fixtureRecord.sourcePath);
    try {
      await access(sourcePath);
      const source = await readFile(sourcePath);
      const actualHash = createHash("sha256").update(source).digest("hex");
      if (actualHash !== fixtureRecord.sourceSha256) issues.push({ path: fixtureRecord.sourcePath, message: `SHA-256 mismatch: expected ${fixtureRecord.sourceSha256}, got ${actualHash}` });
    } catch {
      issues.push({ path: fixtureRecord.sourcePath, message: "registered source fixture does not exist" });
    }
    for (const contract of fixtureRecord.contracts) {
      const contractPath = path.resolve(repositoryRoot, contract.path);
      try {
        await access(contractPath);
      } catch {
        issues.push({ path: contract.path, message: `fixture '${fixtureRecord.id}' references a missing contract artifact` });
        continue;
      }
      if (contract.path.endsWith(".json")) {
        try {
          const contractDocument = JSON.parse(await readFile(contractPath, "utf8")) as { fixture?: { sha256?: unknown } };
          if (contractDocument.fixture?.sha256 !== fixtureRecord.sourceSha256) {
            issues.push({ path: contract.path, message: `fixture '${fixtureRecord.id}' contract SHA-256 does not match the registered source` });
          }
        } catch {
          issues.push({ path: contract.path, message: `fixture '${fixtureRecord.id}' executable contract is not valid JSON` });
        }
      }
    }
  }
  return issues;
}
