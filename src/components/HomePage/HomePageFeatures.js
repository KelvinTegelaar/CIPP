import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faChartBar, faUnlockAlt } from '@fortawesome/free-solid-svg-icons'
import styles from './HomePageFeatures.module.scss'

const FeatureList = [
  {
    title: 'Simplify User Management',
    icon: faUsers,
    description: (
      <>
        Featuring a simple user management interface, CIPP makes it easy to add, edit, and delete
        users and includes a revolutionary offboarding wizard.
      </>
    ),
  },
  {
    title: 'Monitor and Control',
    icon: faChartBar,
    description: (
      <>
        With an ever expanding list of metrics, CIPP makes it easy to monitor and control your
        customers' tenants. Featuring alerts and reports to help you stay informed.
      </>
    ),
  },
  {
    title: 'Secure and Report',
    icon: faUnlockAlt,
    description: (
      <>
        Packing industry best-practice standards and integrations into Microsoft Defender for
        Endpoint / Defender for Business, CIPP gives you the tools you need to help secure your
        customer environments.
      </>
    ),
  },
]

function Feature({ icon, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {
          <FontAwesomeIcon
            icon={icon}
            size="7x"
            className="margin-bottom--md"
            fixedWidth
            color="primary"
          />
        }
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomePageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={clsx('text--center', styles.featureTitle)}>
          Purpose built <strong>by MSPs for MSPS</strong>...
        </h2>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
