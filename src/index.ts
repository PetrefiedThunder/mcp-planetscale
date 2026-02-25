#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://api.planetscale.com/v1";
const RATE_LIMIT_MS = 200;
let last = 0;

function getConfig() {
  const id = process.env.PLANETSCALE_SERVICE_TOKEN_ID;
  const token = process.env.PLANETSCALE_SERVICE_TOKEN;
  const org = process.env.PLANETSCALE_ORG;
  if (!id || !token || !org) throw new Error("PLANETSCALE_SERVICE_TOKEN_ID, PLANETSCALE_SERVICE_TOKEN, PLANETSCALE_ORG required");
  return { id, token, org };
}

async function psFetch(path: string, method = "GET", body?: any): Promise<any> {
  const now = Date.now(); if (now - last < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - (now - last)));
  last = Date.now();
  const { id, token } = getConfig();
  const opts: RequestInit = { method, headers: { Authorization: `${id}:${token}`, "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`PlanetScale ${res.status}: ${(await res.text()).slice(0, 500)}`);
  return res.json();
}

const server = new McpServer({ name: "mcp-planetscale", version: "1.0.0" });

server.tool("list_databases", "List databases in the organization.", {}, async () => {
  const { org } = getConfig();
  const d = await psFetch(`/organizations/${org}/databases`);
  return { content: [{ type: "text" as const, text: JSON.stringify(d.data?.map((db: any) => ({
    id: db.id, name: db.name, region: db.region?.slug, state: db.state, createdAt: db.created_at,
  })), null, 2) }] };
});

server.tool("get_database", "Get database details.", {
  database: z.string(),
}, async ({ database }) => {
  const { org } = getConfig();
  const d = await psFetch(`/organizations/${org}/databases/${database}`);
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

server.tool("list_branches", "List database branches.", {
  database: z.string(),
}, async ({ database }) => {
  const { org } = getConfig();
  const d = await psFetch(`/organizations/${org}/databases/${database}/branches`);
  return { content: [{ type: "text" as const, text: JSON.stringify(d.data?.map((b: any) => ({
    id: b.id, name: b.name, production: b.production, createdAt: b.created_at,
  })), null, 2) }] };
});

server.tool("create_branch", "Create a new database branch.", {
  database: z.string(), name: z.string(), parentBranch: z.string().default("main"),
}, async ({ database, name, parentBranch }) => {
  const { org } = getConfig();
  const d = await psFetch(`/organizations/${org}/databases/${database}/branches`, "POST", { name, parent_branch: parentBranch });
  return { content: [{ type: "text" as const, text: JSON.stringify({ id: d.id, name: d.name }, null, 2) }] };
});

server.tool("list_deploy_requests", "List deploy requests (schema migration PRs).", {
  database: z.string(),
}, async ({ database }) => {
  const { org } = getConfig();
  const d = await psFetch(`/organizations/${org}/databases/${database}/deploy-requests`);
  return { content: [{ type: "text" as const, text: JSON.stringify(d.data?.map((dr: any) => ({
    id: dr.id, number: dr.number, state: dr.state, branch: dr.branch,
    intoBranch: dr.into_branch, createdAt: dr.created_at,
  })), null, 2) }] };
});

server.tool("get_schema", "Get branch schema.", {
  database: z.string(), branch: z.string().default("main"),
}, async ({ database, branch }) => {
  const { org } = getConfig();
  const d = await psFetch(`/organizations/${org}/databases/${database}/branches/${branch}/schema`);
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

async function main() { const t = new StdioServerTransport(); await server.connect(t); }
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
