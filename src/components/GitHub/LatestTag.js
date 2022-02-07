import React, { useEffect, useState } from 'react';
import { getLatestRelease } from '@site/src/utilities/githubHelper';

export default function LatestRelease () {
  const [latestRelease , setLatestRelease] = useState(null);

  useEffect(() => {
    const getGithubData = async () => {
      setLatestTag(await getLatestRelease('kelvintegelaar', 'CIPP'));
    };

    getGithubData();
  }, []);

  return <code>{latestRelease  ?? 'latest'}</code>;
}