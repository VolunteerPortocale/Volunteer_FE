# Git rules

These rules apply to Volunteer_BE, Volunteer_FE and Volunteer_Keycloak.
The main branch (`master`, or `main` in Volunteer_Keycloak) is protected by a GitHub ruleset.

## Branches

- No direct pushes to the main branch. Every change goes through a pull request.
- One branch per ticket, created from the latest main branch.
- Branch names: `type/VOL-XXXX-short-description`
  - `feature/VOL-0012-login-page`
  - `fix/VOL-0015-mongo-timeout`
  - `chore/VOL-0009-git-rules`
- Branches are deleted automatically after merge.

## Commits

- Format: `[VOL-0012] Add login page`
- Short, present tense, one logical change per commit.
- Never commit:
  - passwords, tokens, API keys, `.env` files, database connection strings
  - machine-specific config (local JDK paths in `gradle.properties`, IDE folders)

Secrets go in Render / Cloudflare environment variables, not in the repo.

## Pull requests

- Title: `[VOL-0012] Add login page`
- Before opening: update your branch with the latest main branch and check it builds locally.
- At least 1 approval from someone other than the author.
- Pushing new commits after approval resets the approval.
- All review comments must be resolved before merge.
- Merge with **Squash and merge** (one commit per ticket on the main branch).

## Blocked on the main branch

- direct pushes
- force pushes
- deleting the branch

Force pushing your own feature branch is fine. Use `git push --force-with-lease`, not `--force`.

## Daily flow

Start a ticket:

```
git checkout master
git pull
git checkout -b feature/VOL-0012-login-page
```

Work and push:

```
git add .
git commit -m "[VOL-0012] Add login page"
git push -u origin feature/VOL-0012-login-page
```

Then open a pull request on GitHub and request a reviewer.

If master changed while you were working:

```
git checkout master
git pull
git checkout feature/VOL-0012-login-page
git merge master
git push
```

Editing a file in the GitHub web editor works the same way: choose "Create a new branch and start a pull request" instead of committing to master.
