# Solution Architecture & Reasoning

## Before Task 1

1. I setup `eslint` and `prettier` in order to standardize how every file is formatted;

2. I setup `vitest` and `v8` in order to write tests aiming for 100% coverage of all TS and Svelte files;

3. I wrote enough unit tests and component tests for all files. Only when original component felt off, did I change the original code.

## Task 1 – Inline Editing Implementation

### Interaction Pattern

I implemented single-click inline editing for the task title. Clicking on the title transforms it into an input field with automatic focus and text selection. This approach keeps the interaction fast and intuitive while minimizing friction compared to double-click editing.

### Keyboard Controls

* Enter → Save changes
* Escape → Cancel editing and revert changes

This ensures efficient keyboard support without requiring additional UI controls.

### Saving Behavior

When the user saves:

* The component calls MockAPI.updateTask()
* A loading indicator ("Saving...") appears while the request is in progress

If successful:

* The updated task is emitted via the updated event
* Editing mode exits

If the API fails (10% simulated failure rate):

* An inline error message is displayed
* Editing remains active so the user can retry or cancel

To avoid unnecessary API calls, the component checks whether the title actually changed before saving.

### Error Handling

Since the Mock API simulates realistic failures:

* API errors are caught and shown inline
* The user is not forced out of edit mode
* No optimistic updates were used to prevent UI inconsistencies during failure cases
* This approach prioritizes correctness and clarity over perceived speed.

### UX Considerations

* Clicking the title does not trigger row selection (event propagation is stopped)
* Input auto-focuses and selects text for quick editing
* Save state is clearly indicated
* Cancel restores the original value without making an API call

### Trade-offs

I chose not to use optimistic updates due to the intentional failure rate in the API.

Editing is limited to the title field only, keeping scope focused on the task requirements.
