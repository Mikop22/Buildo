# How to Rebase onto Main

## Step-by-Step Guide

### 1. Commit Your Current Changes

First, commit all your work:

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Add image generation feature with 2D/3D toggle"
```

### 2. Fetch Latest Main Branch

Get the latest changes from the remote main branch:

```bash
git fetch origin main
```

### 3. Rebase Your Branch onto Main

Rebase your current branch onto the latest main:

```bash
git rebase origin/main
```

### 4. Handle Conflicts (if any)

If there are conflicts during rebase:

1. **Git will pause** and show you which files have conflicts
2. **Open the conflicted files** and look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Changes from main
   >>>>>>> commit-hash
   ```
3. **Resolve conflicts** by editing the files to keep what you want
4. **Stage resolved files**:
   ```bash
   git add <resolved-file>
   ```
5. **Continue the rebase**:
   ```bash
   git rebase --continue
   ```

### 5. If You Need to Abort

If something goes wrong and you want to cancel the rebase:

```bash
git rebase --abort
```

### 6. Force Push (if needed)

After rebasing, your branch history has changed. If you've already pushed this branch before, you'll need to force push:

```bash
# ⚠️ WARNING: Only do this if you're sure no one else is working on this branch
git push --force-with-lease origin meshy3DvisualImplementation
```

**Note:** `--force-with-lease` is safer than `--force` because it will fail if someone else has pushed to the branch.

## Quick Command Summary

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"

# 2. Fetch latest main
git fetch origin main

# 3. Rebase
git rebase origin/main

# 4. If conflicts occur, resolve them and continue
git add <resolved-files>
git rebase --continue

# 5. Force push (if you've pushed before)
git push --force-with-lease origin meshy3DvisualImplementation
```

## Alternative: Merge Instead of Rebase

If you prefer to merge instead of rebase (creates a merge commit):

```bash
git fetch origin main
git merge origin/main
```

## What's the Difference?

- **Rebase**: Replays your commits on top of main (cleaner history, linear)
- **Merge**: Creates a merge commit combining both branches (preserves history)

Rebase is generally preferred for feature branches to keep history clean.
