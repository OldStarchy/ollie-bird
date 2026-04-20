A fun[^1] game/editor.

Play at https://oldstarchy.github.io/ollie-bird/

## Development Setup

- Follow Conventional Commits
- Rebase (and tidy your commits) before merging
- You may leave TODO's in the code if they reference an issue number so long as its not the one you're working on. The "current issue" is defined by regexing the branch name `(feature|hotfix)\/(?<issueNumber>\d+)` for an issue number.
    - e.g. `// TODO(#123): Add a thing`
    - TODO's can be listed (`.scripts/list-todos`) and filtered (`.scripts/list-todos 123`)

A few hooks are included to lint on commit and test on push. Install them with `.scripts/install-hooks` (bash).

# To run project...

yarn dev

[^1]: YMMV
