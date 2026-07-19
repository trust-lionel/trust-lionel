"""
update_stats.py

Fetches live GitHub statistics for a user and injects them into the
assets/ascii_preview.svg card by replacing the text content of specific
tagged elements (id="repo_data", id="star_data", etc.).

Requires:
    pip install requests

Environment variable required:
    GH_TOKEN — a GitHub Personal Access Token with 'repo' and 'read:user' scopes
               (create at https://github.com/settings/tokens)

Usage:
    GH_TOKEN=ghp_xxx python update_stats.py trust-lionel assets/ascii_preview.svg
"""

import os
import re
import sys
import requests

GITHUB_API = "https://api.github.com"
GRAPHQL_API = "https://api.github.com/graphql"


def gh_headers(token):
    return {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}


def fetch_graphql_stats(username, token):
    """Fetch repo count, star count, follower count, and contributed-to count via GraphQL."""
    query = """
    query($login: String!) {
      user(login: $login) {
        repositories(first: 1, ownerAffiliations: OWNER, isFork: false) {
          totalCount
        }
        repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, REPOSITORY]) {
          totalCount
        }
        followers {
          totalCount
        }
        starredRepositories {
          totalCount
        }
      }
    }
    """
    # starredRepositories above is repos THEY starred, not stars received —
    # stars received requires summing stargazerCount across owned repos instead.
    resp = requests.post(
        GRAPHQL_API,
        json={"query": query, "variables": {"login": username}},
        headers=gh_headers(token),
    )
    resp.raise_for_status()
    return resp.json()["data"]["user"]


def fetch_owned_repos(username, token):
    """Paginate through all repos owned by the user to sum stars, and collect repo names."""
    repos = []
    page = 1
    while True:
        resp = requests.get(
            f"{GITHUB_API}/users/{username}/repos",
            params={"per_page": 100, "page": page, "type": "owner"},
            headers=gh_headers(token),
        )
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        repos.extend(batch)
        page += 1
    return repos


def fetch_commit_count(username, token):
    """Uses the commit search API to approximate total commit count authored by the user."""
    resp = requests.get(
        f"{GITHUB_API}/search/commits",
        params={"q": f"author:{username}"},
        headers={**gh_headers(token), "Accept": "application/vnd.github.cloak-preview+json"},
    )
    resp.raise_for_status()
    return resp.json().get("total_count", 0)


def fetch_loc_stats(repos, username, token):
    """
    Sums additions/deletions across each repo's contributor stats for this user.
    NOTE: this is the most expensive call — GitHub computes these stats async
    and may return 202 (still calculating) on first request per repo.
    """
    additions, deletions = 0, 0
    for repo in repos:
        owner = repo["owner"]["login"]
        name = repo["name"]
        resp = requests.get(
            f"{GITHUB_API}/repos/{owner}/{name}/stats/contributors",
            headers=gh_headers(token),
        )
        if resp.status_code != 200:
            continue  # skip repos still computing stats or inaccessible
        for contributor in resp.json():
            if contributor.get("author", {}).get("login") == username:
                for week in contributor.get("weeks", []):
                    additions += week.get("a", 0)
                    deletions += week.get("d", 0)
    return additions, deletions


def format_number(n):
    return f"{n:,}"


def inject_into_svg(svg_path, values):
    with open(svg_path, "r", encoding="utf-8") as f:
        svg = f.read()

    for element_id, value in values.items():
        # Replace text content of <tspan id="X">...</tspan>
        pattern = rf'(<tspan[^>]*\bid="{element_id}"[^>]*>)(.*?)(</tspan>)'
        svg = re.sub(pattern, lambda m: m.group(1) + str(value) + m.group(3), svg, count=1)

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg)


def main():
    if len(sys.argv) < 3:
        print("Usage: python update_stats.py <github_username> <path_to_svg>")
        sys.exit(1)

    username = sys.argv[1]
    svg_path = sys.argv[2]
    token = os.environ.get("GH_TOKEN")
    if not token:
        print("ERROR: set the GH_TOKEN environment variable to a GitHub Personal Access Token.")
        sys.exit(1)

    print(f"Fetching stats for {username}...")

    gql = fetch_graphql_stats(username, token)
    repo_count = gql["repositories"]["totalCount"]
    contributed_count = gql["repositoriesContributedTo"]["totalCount"]
    follower_count = gql["followers"]["totalCount"]

    repos = fetch_owned_repos(username, token)
    star_count = sum(r.get("stargazers_count", 0) for r in repos)

    commit_count = fetch_commit_count(username, token)
    additions, deletions = fetch_loc_stats(repos, username, token)
    net_loc = additions - deletions

    values = {
        "repo_data": repo_count,
        "contrib_data": contributed_count,
        "star_data": format_number(star_count),
        "commit_data": format_number(commit_count),
        "follower_data": follower_count,
        "loc_data": format_number(net_loc),
        "loc_add": format_number(additions),
        "loc_del": format_number(deletions),
    }

    print("Fetched values:", values)
    inject_into_svg(svg_path, values)
    print(f"Updated {svg_path}")


if __name__ == "__main__":
    main()
