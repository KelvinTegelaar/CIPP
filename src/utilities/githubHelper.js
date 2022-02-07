import { Octokit } from '@octokit/core';

export const getGithubStars = async (
  owner,
  repository,
) => {
  try {
    const res = await new Octokit().request(`/repos/${owner}/${repository}`);
    return res.data.stargazers_count;
  } catch (err) {
    return null;
  }
};

export const getLatestRelease = async (
  owner,
  repository,
) => {
  try {
    const res = await new Octokit().request(
      `/repos/${owner}/${repository}/tags?per_page=1`
    );
    return res.data[0].name;
  } catch (err) {
    return null;
  }
};