import React, { useEffect, useState } from 'react';
import { getLatestTag } from '@site/src/utilities/githubHelper';

export default function LatestTag() {
  const [latestTag, setLatestTag] = useState(null);

  useEffect(() => {
    const getGithubData = async () => {
      setLatestTag(await getLatestTag('someengineering', 'resoto'));
    };

    getGithubData();
  }, []);

  return <code>{latestTag ?? 'latest'}</code>;
}