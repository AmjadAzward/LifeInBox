const fs = require('node:fs');
const path = require('node:path');

function readLocalEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        if (separator < 0) return [line, ''];
        return [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, '')];
      }),
  );
}

async function main() {
  const environment = readLocalEnvironment();
  const baseUrl = environment.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const model = environment.OLLAMA_MODEL || 'qwen2.5:0.5b';
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      amount: { type: 'number' },
      category: { type: 'string' },
    },
    required: ['title', 'amount', 'category'],
  };

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: schema,
      options: { temperature: 0 },
      messages: [{ role: 'user', content: 'Extract this bill: Water bill, LKR 1200.' }],
    }),
  });

  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const result = JSON.parse(payload.message.content);
  if (!result.title || typeof result.amount !== 'number' || !result.category) {
    throw new Error(`Unexpected structured output: ${JSON.stringify(result)}`);
  }
  console.log(`OLLAMA_TEST_OK model=${model} result=${JSON.stringify(result)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
