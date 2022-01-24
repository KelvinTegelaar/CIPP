import React from 'react';
import clsx from 'clsx';
import styles from './HomePageFeatures.module.scss';

const FeatureList = [
  {
    title: 'Lightning Fast',
    Svg: require.resolve('/static/img/homepage/features/tachometer.svg').default,
    description: (
      <>
        Designed for speed and flexibility, CIPP is built to be easy to use. It has security at it's heart and best of all, it's free<sup>*</sup>.
      </>
    ),
  },
  {
    title: 'PowerShell Behind',
    Svg: require.resolve('/static/img/homepage/features/powershell.svg').default,
    description: (
      <>
        The CIPP backend runs on PowerShell 7. That's right an API build on a language your team already uses and understands. Don't believe us? <a href="https://github.com/KelvinTegelaar/CIPP-API/">Check it out</a>!
      </>
    ),
  },
  {
    title: 'React In Front',
    Svg: require.resolve('/static/img/homepage/features/react.svg').default,
    description: (
      <>
        Since version 2 CIPP is powered by the React framework and Core UI. Making it easier than ever to <a href="/contribute">contribute</a> to the project.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomePageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div className="row">
          <p className="text--small text--center width--full">
            <sup>*</sup> You can install and run CIPP for free (you have to pay your own hosting costs) - but you can also sponsor it to help support the project.
          </p>
        </div>
      </div>
    </section>
  );
}
