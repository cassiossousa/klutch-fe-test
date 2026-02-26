# Klutch AI Front-End Engineering Test

## Solution Architecture & Reasoning

Please check [SOLUTION.md](./SOLUTION.md)

## Setup

```bash
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the component.

## Overview

You're working with a task management table. Currently read-only—your job is to make it interactive.

The component uses **Mock API** (simulated backend in `src/mockApi.ts`) with realistic delays and 10% failure rate for testing error handling.

## Your Tasks

Complete **both tasks**:

### Task 1: Inline Editing

**Goal:** Let users edit task titles directly in the table.

**What to build:**

- Click on a task title to edit it
- Save changes to the Mock API
- Handle loading and error states
- Allow canceling without saving

**Note:** We're deliberately vague on interaction design (double-click? hover? icon?). Choose what feels right and explain why.

The Mock API has a 10% failure rate—make sure your error handling works.

---

### Task 2: Batch Operations

**Goal:** Let users update multiple tasks at once.

**What to build:**

**Backend (Mock API):**
Add a `updateTasksBatch()` method to `src/mockApi.ts`:

```typescript
async updateTasksBatch(
  taskIds: string[],
  updates: Partial<ListableTask>
): Promise<ListableTask[]>
```

Must validate all taskIds exist before updating any. Simulate network delay and errors like other methods.

**Frontend:**
Build a UI for bulk actions. When multiple tasks are selected, show controls to change their status. Something like:

```
[✓ 3 tasks selected]  [Change Status ▼]  [Cancel]
```

Users should be able to:

- Select multiple tasks (checkboxes work, but consider adding Shift+Click for ranges)
- Change status of all selected tasks at once
- See loading state during update
- Get clear feedback if something fails

## Bonus (Optional)

Finish early? Try:

- Shift+Click for range selection
- Keyboard navigation (Tab, Enter, Escape)
- Optimistic updates
- Edit other fields (dates, assignees)
- Unit tests

## Submission

**Submit:**

1. Git repo or ZIP file with your code
2. Brief summary (5-10 sentences):
   - Task 1: What interaction pattern did you choose and why?
   - Task 2: How did you approach batch updates?
   - Any challenges or trade-offs?
3. Screenshots or video showing it working

---

## Project Structure

```
src/
├── components/
│   ├── TaskTableRow.svelte       # Main component to modify
│   └── stubs/                    # UI components (Td, Tr, Pill, etc.)
├── types.ts                      # TypeScript types
├── mockApi.ts                    # Simulated backend
├── mockData.ts                   # Sample tasks (5 tasks)
├── App.svelte                    # Demo page
└── app.css                       # Styles
```

## How It Works

**Data Flow:**

1. `App.svelte` loads tasks from `MockAPI`
2. `TaskTableRow` receives task props
3. User edits → call `MockAPI.updateTask()`
4. `TaskTableRow` emits 'updated' event
5. `App.svelte` updates the task list

**Event Pattern:**

```svelte
// Child emits
dispatch('updated', updatedTask)

// Parent listens
<TaskTableRow on:updated={handleUpdate} />
```

## Mock API Usage

```typescript
import { getMockAPI } from "./mockApi";

const api = getMockAPI();

// Update a task
try {
  const updated = await api.updateTask("task-1", {
    title: "New title",
  });
  // Success! Updated task returned
} catch (error) {
  // Handle error (10% failure rate)
  alert("Failed: " + error.messages);
}
```

**API Behavior:**

- Delays: 200-600ms (simulates network)
- Failures: 10% random rate
- Validation: Rejects empty titles

## TypeScript Types

See `src/types.ts` for all types. Key ones:

- `ListableTask` - Task object structure
- `TaskStatus` - 'Open' | 'InProgress' | 'Completed' | etc.
- `ValidationError` - Error class for API failures

---

## What We're Looking For

- Does it work?
- Is it intuitive to use?
- Clean, readable code?
- Proper error handling?
- Good UX (loading states, feedback)?
- Thoughtful design decisions?

Please share a github repo or send a zip file to gia@klutch.ai. Good luck!
