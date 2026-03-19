# Braincells

Real-time AI agent orchestration interface with MCP integration, skill building, and project management.

## Features

- **Agent Management** — Create, configure, and monitor AI agents with different roles (orchestrator, worker, reviewer, researcher, coder)
- **Real-time Chat** — Stream responses from ChatGPT API with per-agent conversations
- **MCP Servers** — Connect to Model Context Protocol servers (SSE, HTTP, stdio) to extend agents with external tools
- **Skill Builder** — Create reusable prompt templates and tool configurations
- **Projects** — Organize agents and skills into projects, track interactions
- **Agent Network** — Visual graph of agent connections and interactions
- **Notion Integration** — Sync projects to Notion databases
- **Real-time Rendering** — SSE streaming for live token-by-token responses

## Stack

- **Next.js 15** + TypeScript + App Router
- **Tailwind CSS 4** — Dark neural theme
- **Zustand** — Lightweight state management
- **Lucide Icons**
- **OpenAI API** — ChatGPT streaming completions
- **Notion API** — Project sync
- **MCP Protocol** — JSON-RPC over SSE/HTTP

## Setup

```bash
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes (chat, mcp, notion)
│   ├── agents/           # Agent management page
│   ├── dashboard/        # Overview dashboard
│   ├── mcp/              # MCP server management
│   ├── projects/         # Project management
│   └── skills/           # Skill builder
├── components/           # React components
│   ├── agents/           # Agent cards, forms, chat panel
│   ├── dashboard/        # Stats, activity feed, network graph
│   ├── layout/           # Shell, sidebar, header
│   ├── mcp/              # MCP server cards & forms
│   ├── projects/         # Project cards & forms
│   ├── shared/           # Modal, StatusBadge
│   └── skills/           # Skill cards & forms
├── lib/                  # Core libraries
│   ├── openai.ts         # ChatGPT API client
│   ├── notion.ts         # Notion API client
│   ├── mcp.ts            # MCP protocol handler
│   └── colors.ts         # Agent color system
├── store/                # Zustand state management
└── types/                # TypeScript interfaces
```
