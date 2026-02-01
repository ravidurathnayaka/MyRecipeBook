/**
 * Release script: bumps version based on conventional commits since last tag,
 * updates package.json, commits, and creates a git tag.
 *
 * Bump rules (Conventional Commits):
 * - BREAKING CHANGE or subject ends with ! → major
 * - feat: or feat(scope): → minor
 * - fix:, chore:, docs:, style:, refactor:, perf:, test:, etc. → patch
 * - No conventional prefix or merge → patch
 *
 * Usage: pnpm run release
 * Then:  git push && git push origin --tags
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const PACKAGE_JSON = path.join(process.cwd(), "package.json");

function getCurrentVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf-8"));
  const v = pkg.version;
  if (!v || typeof v !== "string") throw new Error("package.json missing version");
  return v;
}

function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const match = version.replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return { major: +match[1], minor: +match[2], patch: +match[3] };
}

function bumpVersion(
  current: string,
  bump: "major" | "minor" | "patch"
): string {
  const { major, minor, patch } = parseVersion(current);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function getCommitsSinceLastTag(): string[] {
  let range = "HEAD";
  try {
    const tag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
    }).trim();
    if (tag) range = `${tag}..HEAD`;
  } catch {
    // No tags yet; use all commits
  }
  try {
    const log = execSync(`git log ${range} --pretty=format:%s`, {
      encoding: "utf-8",
    }).trim();
    if (!log) return [];
    return log.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function getBumpType(commits: string[]): "major" | "minor" | "patch" {
  let major = false;
  let minor = false;
  for (const msg of commits) {
    const firstLine = msg.split("\n")[0];
    if (
      /^BREAKING CHANGE:/m.test(msg) ||
      firstLine.includes("BREAKING CHANGE") ||
      /!:\s/.test(firstLine) ||
      /\([^)]*\)!\s*:/.test(firstLine)
    ) {
      major = true;
      break;
    }
    if (/^feat(\([^)]*\))?!?:\s/.test(firstLine)) minor = true;
  }
  if (major) return "major";
  if (minor) return "minor";
  return "patch";
}

function updatePackageJson(newVersion: string): void {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf-8"));
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n");
}

function main(): void {
  const current = getCurrentVersion();
  const commits = getCommitsSinceLastTag();
  const bump = commits.length === 0 ? "patch" : getBumpType(commits);
  const newVersion = bumpVersion(current, bump);

  if (newVersion === current) {
    console.log("No version change (already at latest). Exiting.");
    process.exit(0);
  }

  console.log(`Bump: ${bump} (${current} → ${newVersion})`);
  if (commits.length > 0) {
    console.log(`Commits since last tag: ${commits.length}`);
  }
  updatePackageJson(newVersion);
  doCommitAndTag(newVersion);
}

function doCommitAndTag(version: string): void {
  const tag = `v${version}`;
  execSync("git add package.json");
  execSync(`git commit -m "chore(release): ${tag}"`);
  execSync(`git tag -a ${tag} -m "Release ${tag}"`);
  console.log(`\n✓ Version set to ${version}`);
  console.log(`✓ Committed and tagged ${tag}`);
  console.log("\nPush to GitHub:");
  console.log("  git push && git push origin --tags\n");
}

main();
