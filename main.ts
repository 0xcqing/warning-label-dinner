import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "WARNING: Do not ask this unit what it wants for dinner. It has no answer and it has rejected all of yours.";

function fail(message: string): never {
  process.stderr.write(`entry invalid: ${message}\n`);
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const entryPath = join(outputDir, "entry.txt");

if (LINE.split("\n").length !== 1) {
  fail("the line must be a single line with no newline inside it");
}

const charCount = [...LINE].length;
if (charCount < 1 || charCount > 160) {
  fail(`character count ${charCount} is outside 1..160`);
}

const byteCount = Buffer.byteLength(LINE, "utf8");
if (byteCount < 1 || byteCount > 160) {
  fail(`byte count ${byteCount} is outside 1..160`);
}

if (LINE.trim().length === 0) {
  fail("the line is empty after trimming");
}

const contents = `${LINE}\n`;
const contentsBytes = Buffer.from(contents, "utf8");

mkdirSync(outputDir, { recursive: true });
writeFileSync(entryPath, contentsBytes);

const writtenBytes = readFileSync(entryPath);
const expectedSize = byteCount + 1;
if (writtenBytes.length !== expectedSize) {
  fail(
    `entry.txt is ${writtenBytes.length} bytes on disk, expected ${expectedSize} (${byteCount} line bytes plus one trailing newline)`,
  );
}
if (!writtenBytes.equals(contentsBytes)) {
  fail("entry.txt bytes do not match the line plus one trailing newline");
}
if (writtenBytes.toString("utf8") !== contents) {
  fail("entry.txt does not decode back to the exact line and newline");
}

process.stdout.write(
  `wrote ${charCount} characters, ${byteCount} bytes of content, ${writtenBytes.length} bytes on disk to ${entryPath}\n${LINE}\n`,
);
