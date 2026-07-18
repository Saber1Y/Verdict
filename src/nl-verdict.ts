/**
 * nl-verdict.ts
 *
 * Natural-language front door for the existing verdict-server API.
 * Does NOT touch the contract, circuit, or POST /verdict handler —
 * it only translates plain text into the same payload that endpoint
 * already accepts, then calls it.
 *
 * Flow:
 *   plain text -> parseIntent() -> { dealId, threshold, counterpartyWallet }
 *              -> POST http://localhost:3456/verdict
 *              -> same response shape the server already returns
 */

const VERDICT_SERVER_URL = process.env.VERDICT_SERVER_URL ?? "http://localhost:3456";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is required for the NL parsing layer");
}

// ---- Types -----------------------------------------------------------

type ParsedRequest =
  | { kind: "request"; dealId: string; threshold: number; counterpartyWallet: string }
  | { kind: "clarify"; question: string }
  | { kind: "reject"; reason: string };

type VerdictResult = {
  success: boolean;
  verdictPassed: boolean | null;
  txId: string | null;
  blockHeight: number | null;
  dealId: string;
};

// ---- Tool definitions for the model -----------------------------------
// Three explicit outcomes, no fourth path where the model silently guesses.

const tools: Array<{
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> = [
  {
    type: "function",
    function: {
      name: "submit_verdict_request",
      description:
        "Call this when the message clearly asks whether a counterparty clears a solvency threshold for a specific deal, and all three fields are present or unambiguously inferable from the message.",
      parameters: {
        type: "object",
        properties: {
          dealId: { type: "string", description: "The deal identifier, e.g. 'deal #4471' -> '4471'" },
          threshold: { type: "number", description: "The minimum balance threshold in USD, e.g. 50000" },
          counterpartyWallet: { type: "string", description: "Wallet address or handle of the agent being checked" },
        },
        required: ["dealId", "threshold", "counterpartyWallet"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_clarification",
      description:
        "Call this when the message is clearly a solvency-check request but is missing the deal ID, the threshold, or the counterparty. Ask for exactly the missing piece — do not guess or default a value.",
      parameters: {
        type: "object",
        properties: {
          question: { type: "string", description: "A short, direct question asking for the missing field(s)" },
        },
        required: ["question"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reject_request",
      description:
        "Call this when the message does not map to a solvency-verification request at all — e.g. small talk, an unrelated question, or a request for a different kind of check this system doesn't support.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Brief, plain-language reason this isn't a solvency-check request" },
        },
        required: ["reason"],
      },
    },
  },
];

// ---- Step 1: parse plain text into a structured intent -----------------

async function parseIntent(text: string): Promise<ParsedRequest> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${OPENROUTER_API_KEY!}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      max_tokens: 512,
      tools,
      tool_choice: "required", // force one of the three tools, never plain text
      messages: [
        {
          role: "user",
          content: `Parse this message and call exactly one tool: submit_verdict_request, ask_clarification, or reject_request.\n\nMessage: "${text}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const toolCall = choice?.message?.tool_calls?.[0];
  const toolUse = toolCall
    ? { name: toolCall.function.name, input: JSON.parse(toolCall.function.arguments) }
    : null;

  if (!toolUse) {
    // Defensive fallback — should not happen with tool_choice: "any"
    return { kind: "reject", reason: "Could not parse a structured request from this message." };
  }

  switch (toolUse.name) {
    case "submit_verdict_request":
      return {
        kind: "request",
        dealId: toolUse.input.dealId,
        threshold: toolUse.input.threshold,
        counterpartyWallet: toolUse.input.counterpartyWallet,
      };
    case "ask_clarification":
      return { kind: "clarify", question: toolUse.input.question };
    case "reject_request":
      return { kind: "reject", reason: toolUse.input.reason };
    default:
      return { kind: "reject", reason: `Unrecognized tool call: ${toolUse.name}` };
  }
}

// ---- Step 2: call the existing, already-working verdict endpoint -------

async function callVerdictServer(
  dealId: string,
  threshold: number,
  counterpartyWallet: string
): Promise<VerdictResult> {
  const response = await fetch(`${VERDICT_SERVER_URL}/verdict`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dealId, threshold, counterparty: counterpartyWallet }),
  });

  if (!response.ok) {
    throw new Error(`verdict-server error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

// ---- Public entry point --------------------------------------------------

export async function requestVerdict(naturalLanguageInput: string): Promise<
  | { status: "result"; result: VerdictResult }
  | { status: "clarify"; question: string }
  | { status: "rejected"; reason: string }
> {
  const parsed = await parseIntent(naturalLanguageInput);

  if (parsed.kind === "clarify") {
    return { status: "clarify", question: parsed.question };
  }

  if (parsed.kind === "reject") {
    return { status: "rejected", reason: parsed.reason };
  }

  const result = await callVerdictServer(parsed.dealId, parsed.threshold, parsed.counterpartyWallet);
  return { status: "result", result };
}

// ---- CLI entry point for quick manual testing -----------------------------
// Usage: npx tsx src/nl-verdict.ts "does Agent B clear $50,000 for deal #4471?"

const isMain = process.argv[1]?.endsWith("nl-verdict.ts");
if (isMain) {
  const input = process.argv.slice(2).join(" ");

  if (!input) {
    console.error('Usage: npx tsx src/nl-verdict.ts "does Agent B clear $50,000 for deal #4471?"');
    process.exit(1);
  }

  requestVerdict(input)
    .then((outcome) => {
      if (outcome.status === "clarify") {
        console.log(`Agent B: ${outcome.question}`);
      } else if (outcome.status === "rejected") {
        console.log(`Not a solvency-check request: ${outcome.reason}`);
      } else {
        const { verdictPassed, txId, blockHeight, dealId } = outcome.result;
        console.log(`Agent B: computing proof...`);
        console.log(`Agent B: verdict disclosed ${verdictPassed ? "TRUE" : "FALSE"}`);
        console.log(`  deal:    ${dealId}`);
        console.log(`  tx:      ${txId}`);
        console.log(`  block:   ${blockHeight}`);
      }
    })
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}
