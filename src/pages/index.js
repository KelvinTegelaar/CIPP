import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomePageFeatures from '@site/src/components/HomePage/HomePageFeatures';
import styles from './index.module.scss';
import IndexContent from './_index.md';

function HomePageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--homepage', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
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
