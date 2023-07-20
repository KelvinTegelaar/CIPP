import React from 'react'
import { CFooter, CImage, CLink } from '@coreui/react'
import { Link } from 'react-router-dom'
import huntressLogo from 'src/assets/images/huntress_teal.png'
import dattoLogo from 'src/assets/images/datto.png'
import rewstLogo from 'src/assets/images/rewst.png'

const AppFooter = () => {
  return (
    <CFooter className="d-flex justify-content-between align-items-center">
      <div className="sponsors">
        <p>
          This application is sponsored by{' '}
          <CLink href="https://www.huntress.com/">
            <CImage src={huntressLogo} alt="Huntress" />
          </CLink>{' '}
          <CLink href="https://datto.com/">
            <CImage src={dattoLogo} alt="Datto" />
          </CLink>{' '}
          <CLink href="https://rewst.io/">
            <CImage src={rewstLogo} alt="Datto" />
          </CLink>
        </p>
      </div>
      <nav className="footer-nav">
        <Link to="/license">License</Link>
      </nav>
    </CFooter>
  )
}

export default React.memo(AppFooter)
