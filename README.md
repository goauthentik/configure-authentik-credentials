<p align="center">
    <img src="https://goauthentik.io/img/icon_top_brand_colour.svg" height="150" alt="authentik logo">
</p>

---

[![Test](https://img.shields.io/github/actions/workflow/status/goauthentik/configure-authentik-credentials/ci.yml?branch=main&label=test&style=for-the-badge)](https://github.com/goauthentik/configure-authentik-credentials/actions/workflows/ci.yml)
[![Check dist/](https://img.shields.io/github/actions/workflow/status/goauthentik/configure-authentik-credentials/check-dist.yml?branch=main&label=build&style=for-the-badge)](https://github.com/goauthentik/configure-authentik-credentials/actions/workflows/check-dist.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/goauthentik/configure-authentik-credentials/codeql-analysis.yml?branch=main&label=codeql&style=for-the-badge)](https://github.com/goauthentik/configure-authentik-credentials/actions/workflows/codeql-analysis.yml)
[![Code Coverage](https://img.shields.io/codecov/c/gh/goauthentik/configure-authentik-credentials?style=for-the-badge)](https://codecov.io/gh/goauthentik/configure-authentik-credentials)

# configure-authentik-credentials GitHub Action

Use this action to authenticate to an application protected by authentik using the JWT token
generated by GitHub Actions.

## Usage

After testing, you can create version tag(s) that developers can use to reference different stable
versions of your action. For more information, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) in the GitHub
Actions toolkit.

To include the action in a workflow in another repository, you can use the `uses` syntax with the
`@` symbol to reference a specific branch, tag, or commit hash.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4
  - name: Get authentik token
    id: authentik-token
    uses: goauthentik/configure-authentik-credentials@v1 # Commit with the `v1` tag
    with:
      authentik_url: https://id.goauthentik.io
      client_id: foobar
  - name: Use the token
    run: |
      ${{ steps.authentik-token.outputs.token }}
```

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release) designed to streamline
the process of tagging and pushing new releases for GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use, based on release
tags. This script simplifies this process by performing the following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most recent SemVer
   release tag of the current branch, by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new release tag. To
   assist with this, the script displays the tag retrieved in the previous step, and validates the
   format of the inputted tag (vX.X.X). The user is also reminded to update the version field in
   package.json.
1. **Tagging the new release:** The script then tags a new release and syncs the separate major tag
   (e.g. v1, v2) with the new release tag (e.g. v1.0.0, v2.1.2). When the user is creating a new
   major release, the script auto-detects this and creates a `releases/v#` branch for the previous
   major version.
1. **Pushing changes to remote:** Finally, the script pushes the necessary commits, tags and
   branches to the remote repository. From here, you will need to create a new release in GitHub so
   users can easily reference the new tags in their workflows.
