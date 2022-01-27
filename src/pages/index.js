import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomePageFeatures from '@site/src/components/HomePage/HomePageFeatures';
import { getGithubStars, getLatestTag } from '@site/src/utilities/githubHelper';
import GitHubLogo from '@site/static/img/icons/GitHub.svg';
import GitHubStar from '@site/static/img/icons/GitHubStar.svg';
import styles from './index.module.scss';
import IndexContent from './_index.md';

function HomePageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const [cippVersion, setCippVersion] = useState(null);
  const [cippApiVersion, setCippApiVersion] = useState(null);
  const [githubStars, setGithubStars] = useState(null);

  useEffect(() => {
    const getGithubData = async () => {
      setCippVersion(await getLatestTag('KelvinTegelaar', 'CIPP'));
      setCippApiVersion(await getLatestTag('KelvinTegelaar', 'CIPP-API'));
      setGithubStars(await getGithubStars('KelvinTegelaar', 'CIPP'));
    };

    getGithubData();
  }, []);

  return (
    <header className={clsx('hero hero--homepage', styles.hero)}>
      <div className={styles.heroInner}>
        <div className={clsx(styles.heroSubtitle)}>
          <span><strong>Multi-tenant</strong> management for <strong>Microsoft 365</strong> done right...</span>
          <span className={styles.heroButtons}>
            {cippVersion && (
              <>
                <a
                  href="https://github.com/KelvinTegelaar/CIPP/releases/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="button button--primary button--lg"
                >
                  <GitHubLogo className={styles.buttonIcon} />
                  {cippVersion.startsWith('v')
                    ? cippVersion
                    : `v${cippVersion}`}
                </a>
                {!!githubStars && (
                  <a
                    href="https://github.com/KelvinTegelaar/CIPP/stargazers"
                    target="_blank"
                    rel="noreferrer noopener"
                    className={clsx('button button--lg', styles.speechButton)}
                  >
                    <GitHubStar className={styles.buttonIcon} />
                    {githubStars}
                  </a>
                )}
              </>
            )}
          </span>
        </div>
        <div className={clsx(styles.buttons)}>
          <Link
            className="button button--primary button--lg"
            to="/docs/user/">
            User Guide
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/dev/">
            Developer Guide
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Multitenant management for Microsoft 365 done right...">
      <HomePageHeader />
      <main>
        <HomePageFeatures />
        <div className="width--full text--center">
          <Link className="button button--outline button--primary button--lg" to="https://github.com/sponsors/KelvinTegelaar">
            Sponsor on GitHub
          </Link>
        </div>
        <div className="container margin-top--lg">
          <IndexContent />
        </div>
      </main>
    </Layout>
  );
}
