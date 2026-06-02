import { readFile } from "node:fs/promises";
import { getGameDefinition } from "./games/registry.js";

const definitionsDirectory = new URL("./games/definitions/", import.meta.url);

export async function createStandalonePackage(gameType) {
  const definition = getGameDefinition(gameType);
  if (!definition?.sourceFile) {
    throw new Error("Definition source file not found.");
  }

  const definitionSource = await readFile(
    new URL(definition.sourceFile, definitionsDirectory),
    "utf8",
  );
  const safeName = gameType.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const files = [
    {
      name: "server.mjs",
      content: createServerSource(),
    },
    {
      name: "game.definition.mjs",
      content: definitionSource,
    },
    {
      name: "README.md",
      content: createReadmeSource(definition),
    },
  ];

  return {
    fileName: `${safeName}-standalone.zip`,
    content: createZip(files),
  };
}

function createServerSource() {
  return `import { createServer } from "node:http";
import * as definitionModule from "./game.definition.mjs";

const gameDefinition = Object.values(definitionModule).find(
  (value) => value && typeof value === "object" && value.type && value.title,
);

if (!gameDefinition) {
  throw new Error("No exported game definition object found.");
}

createServer((request, response) => {
  if (request.url === "/definition") {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(gameDefinition, null, 2));
    return;
  }

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(\`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>\${gameDefinition.title}</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 32px; background: #f4f4f5; color: #18181b; }
      main { max-width: 960px; margin: 0 auto; }
      pre { overflow: auto; padding: 16px; border-radius: 8px; background: #18181b; color: #fafafa; }
    </style>
  </head>
  <body>
    <main>
      <h1>\${gameDefinition.title}</h1>
      <p>Standalone definition preview server.</p>
      <pre>\${JSON.stringify(gameDefinition, null, 2)}</pre>
    </main>
  </body>
</html>\`);
}).listen(3000, () => {
  console.log("Standalone preview: http://127.0.0.1:3000");
});
`;
}

function createReadmeSource(definition) {
  return `# ${definition.title} Standalone Preview

This package is a minimal dependency-free Node HTTP preview for one game definition.

## Run

\`\`\`bash
node server.mjs
\`\`\`

Then open:

\`\`\`txt
http://127.0.0.1:3000
\`\`\`

JSON endpoint:

\`\`\`txt
http://127.0.0.1:3000/definition
\`\`\`
`;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = Buffer.from(file.content);
    const crc = crc32(data);
    const localHeader = createLocalHeader(name, data, crc);
    const centralHeader = createCentralHeader(name, data, crc, offset);

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = createEndRecord(files.length, centralDirectory.length, offset);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function createLocalHeader(name, data, crc) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name]);
}

function createCentralHeader(name, data, crc, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, name]);
}

function createEndRecord(fileCount, centralSize, centralOffset) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(fileCount, 8);
  header.writeUInt16LE(fileCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});
