# Overview
As we continue to develop the project, it would be useful to have a working manual deployment action in place. This would allow for quicker testing of PRs and Branches. The project is only being developed by me and Copilot, as such a manual deployment action would be sufficient for now.

# Desired Behavior
- A GitHub Action that can be manually triggered from the Actions tab
- Action can accept a branch name or commit SHA as input
- Deploys the given branch/commit to GitHub Pages
- Provides a URL to access the deployed version
- Should work for any branch, not just main
- Should clean up previous deployments to avoid clutter

# Out of Scope
- Automatic deployments on push or PR merge
- Complex deployment strategies (e.g., blue-green deployments)
- Rollback mechanisms for failed deployments
- Integration with third-party deployment services

# Definition of Done
- [ ] A GitHub Action workflow file is created in `.github/workflows/`
- [ ] The workflow can be manually triggered with branch/commit input
- [ ] The action successfully deploys the specified version to GitHub Pages
- [ ] Documentation is added to the README on how to use the deployment action