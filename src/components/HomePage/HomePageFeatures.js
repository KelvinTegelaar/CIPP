import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faChartBar, faUnlockAlt } from '@fortawesome/free-solid-svg-icons'
import styles from './HomePageFeatures.module.scss'

const FeatureList = [
  {
    title: 'Central user management',
    icon: faUsers,
    description: (
      <>
        Featuring a simple user management interface, CIPP makes it easy to add, edit, and delete
        users. Including offboarding users, changing calendar permissions, shared mailboxes and
        more!
      </>
    ),
  },
  {
    title: 'Easy standardisation',
    icon: faChartBar,
    description: (
      <>
        Deploy standards across all of your clientbase, making tenants always be in the state you
        want them to be in. Thanks to alerting and best practices you are able to give your clients
        the best experience.
      </>
    ),
  },
  {
    title: 'Secure and Report',
    icon: faUnlockAlt,
    description: (
      <>
        Packing industry best-practice standards and integrations allowing you to report on
        everything in your M365 tenants, CIPP gives you the tools you need to help secure your
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
          CIPP is a M365 Multi-tenant solution <strong>by MSPs for MSPS</strong>
        </h2>
        <hr></hr>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
