import React from 'react';
import Layout from '@theme/Layout';
import Contributor from './contributor';
import contributors from '@site/data/contributors.json';

export default function Team() {
  return (
    <Layout>
      <div className='hero'>
        <div className='container'>
          <div className='text--center margin-bottom--lg'>
            <h1 className='hero__title margin--none'>CIPP Contributors</h1>
          </div>
          <div className='row'>
            {contributors &&
              contributors.map((props, idx) => <Contributor key={idx} {...props} />)}
          </div>
        </div>
      </div>
    </Layout>
  );
}