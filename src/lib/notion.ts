const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const NOTION_VERSION = "2022-06-28";

async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error: ${res.status} - ${err}`);
  }

  return res.json();
}

export async function queryDatabase(databaseId: string, filter?: object) {
  return notionFetch(`/databases/${databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({ filter }),
  });
}

export async function createPage(
  databaseId: string,
  properties: Record<string, unknown>,
  children?: unknown[]
) {
  return notionFetch("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
      children,
    }),
  });
}

export async function updatePage(
  pageId: string,
  properties: Record<string, unknown>
) {
  return notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function getPage(pageId: string) {
  return notionFetch(`/pages/${pageId}`);
}

export async function getBlockChildren(blockId: string) {
  return notionFetch(`/blocks/${blockId}/children`);
}

export async function searchNotion(query: string) {
  return notionFetch("/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function syncProjectToNotion(
  project: { name: string; description: string; status: string },
  databaseId: string
) {
  return createPage(databaseId, {
    Name: { title: [{ text: { content: project.name } }] },
    Description: {
      rich_text: [{ text: { content: project.description } }],
    },
    Status: { select: { name: project.status } },
  });
}
