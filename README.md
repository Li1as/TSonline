# TSonline

NJU course project for **网络应用开发技术 2026 Spring**.

TSonline is a prototype online tabletop platform and board-game editor. The
project focuses on a runnable front-end/back-end demo: users can create rooms,
join rooms, chat, play definition-driven card games, inspect game definitions,
edit definition drafts, and export a minimal standalone preview package.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, `ws` WebSocket server
- Game content: JavaScript `GameDefinition` files
- Storage: in-memory state plus local definition files

## Run Locally

Install dependencies:

```bash
npm install
```

Start the WebSocket/backend server:

```bash
npm run server
```

Start the frontend dev server in another terminal:

```bash
npm run dev
```

Default addresses:

- Frontend: Vite dev server output, usually `http://localhost:5173`
- Backend/WebSocket: `http://127.0.0.1:8787`

Build:

```bash
npm run build
```

## Main Features

### Frontend Pages

- Home page with platform overview and static workspace preview
- Rooms page for room listing and room creation
- Room detail page with room info, player list, chat, and game/editor area
- Games page showing all loaded game definitions
- Game definition detail page showing original `.definition.js` source

### Room and Realtime Features

- Create `play` rooms and `edit` rooms
- Join rooms through WebSocket
- Random user names for lightweight identity
- Realtime room list, player list, and chat synchronization
- Room capacity checks
- Invalid-room state when a loaded game definition changes

### Play Room Features

- Create play rooms from loaded `GameDefinition` entries
- Start new game sessions
- Server-authoritative game state
- Generic frontend game renderer for definition-driven games
- Specialized Simple Card Demo view retained as the first demo entry

### Game Engine Prototype

The project includes a minimal generic game engine with:

- zone-based state: deck, discard, round play, player hands
- vars-based runtime state
- player attributes such as HP, score, energy, shield
- action pipeline
- conditions
- effects
- triggers
- victory conditions
- card templates and card instances

Implemented example definitions:

- `simpleCardDemo`
- `attributeDuel`
- `runeSiegeDuel`
- minimal registry/testing definitions

### Editor Room Prototype

Editor rooms currently support two modes:

- Placeholder showcase room
- Definition text editor room

The definition editor supports:

- typing or pasting a future `GameDefinition`
- submitting the text to the backend
- saving the submitted text as a `.definition.js` file
- an AI prompt area for generating definition drafts

### Definition Registry and Hot Reload

The backend scans `server/games/definitions/*.definition.js`.

When a definition file changes:

- the registry reloads definitions
- clients receive updated game definition snapshots
- existing rooms using changed rules are marked invalid
- the Games page updates automatically

### AI-Assisted Definition Drafting

The backend contains a prompt and helper function for generating
`GameDefinition` source code from natural language descriptions.

The current implementation supports an OpenAI-compatible API shape:

- `apiUrl`
- `apiKey`
- `model`
- natural language description

The frontend can send those inputs and display the generated response in the
definition editor.

### Standalone Export

The Games page can download a minimal standalone zip package for a definition.
The zip contains:

- `server.mjs`
- `game.definition.mjs`
- `README.md`

The standalone package has no npm dependencies and runs with:

```bash
node server.mjs
```

It is a minimal HTTP preview server for showing the selected game definition.

## Minimal Implementations and Extension Points

This project intentionally contains several minimal implementations. They are
enough for a course prototype and are designed as clear extension points.

### User System

Current state:

- no login system
- users receive random names
- identity exists only during the WebSocket session

Why this is acceptable:

- the course goal is to demonstrate networked room/game behavior
- authentication would add unrelated complexity

Future work:

- account login
- persistent user profiles
- room ownership and permission checks

### Storage

Current state:

- rooms, players, messages, and game states are stored in memory
- submitted definitions are written directly to local files

Why this is acceptable:

- easy to run locally
- makes the realtime flow clear
- avoids database setup for a small course project

Future work:

- database storage for rooms and messages
- versioned definition storage
- definition review/publish workflow

### Definition Editing

Current state:

- editor submits raw `.definition.js` text
- backend writes it directly to the definitions directory
- validation is intentionally minimal

Why this is acceptable:

- demonstrates the editor-to-definition-to-hot-reload pipeline
- suitable for local coursework where code is not exposed publicly

Future work:

- switch from JS source to pure JSON
- add schema validation
- block unsafe content
- add editor-side structured forms

### Game Engine

Current state:

- supports a useful subset of conditions, effects, triggers, and victory rules
- some behavior is still implemented as built-in effects such as `dealDamage`
- not all board game mechanics can be expressed yet

Why this is acceptable:

- enough to prove that multiple games can be added through definitions
- avoids building a full visual rule editor in a 2-credit course project

Future work:

- richer condition expressions
- computed effect values
- more trigger events
- schema and test tools for definitions
- replay/debug views for rule execution

### Multiplayer Reliability

Current state:

- WebSocket broadcast works for local testing
- no reconnect recovery
- no durable session restore
- no horizontal scaling

Why this is acceptable:

- sufficient for local LAN/course demo
- keeps backend understandable

Future work:

- reconnect handling
- heartbeat and stale room cleanup
- conflict handling for simultaneous actions
- deployable state backend

### AI Generation

Current state:

- AI can generate a definition draft from natural language
- result is shown in the editor for manual review
- it is not guaranteed to be fully valid or balanced

Why this is acceptable:

- demonstrates AI-assisted authoring as a workflow
- keeps the human-in-the-loop editing step

Future work:

- automatic schema validation
- auto-fix prompts
- example-based prompting from existing definitions
- safe backend-managed API keys

### Standalone Export

Current state:

- exports a dependency-free HTTP preview server
- does not export the full multiplayer runtime

Why this is acceptable:

- demonstrates packaging/export capability
- avoids a large deployment/runtime bundling problem

Future work:

- export a playable generic runtime
- include WebSocket multiplayer support
- package selected assets
- add version metadata

## Course Project Rationale

For a 2-credit elective course project, this scope is appropriate because the
project demonstrates the core concepts of web application development:

- component-based frontend development
- client-side routing
- backend WebSocket communication
- server-authoritative state updates
- dynamic data rendering
- file-based content loading
- hot reload behavior
- extensible architecture
- AI-assisted workflow integration

The project avoids production-level concerns where they would distract from the
course objectives. Instead, those areas are left as explicit extension points and
documented future work.
