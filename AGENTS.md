# Repository instructions

## Running commands

- Do not run project code, development servers, builds, tests, linters, package installs, or other executable project commands unless the user explicitly asks for execution.
- Prefer suggesting the exact command for the user to run themselves.
- Read-only inspection commands are allowed when needed to understand or review the repository.
- If execution would materially help verify a change, explain what it would verify and ask the user to run it, unless they have already explicitly requested that verification.

## Changes

- Keep changes focused on the user's request.
- Preserve existing user changes and avoid unrelated cleanup.
- Use `apply_patch` for text-file edits.
