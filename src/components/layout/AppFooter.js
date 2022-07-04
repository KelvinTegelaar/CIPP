import React from 'react'
import { CFooter, CImage, CLink } from '@coreui/react'
import { Link } from 'react-router-dom'
import huntressLogo from 'src/assets/images/huntress_teal.png'

const AppFooter = () => {
  return (
    <CFooter className="d-flex justify-content-between align-items-center">
      <div className="sponsors">
        <p>
          This application is sponsored by&nbsp;
          <CLink href="https://www.huntress.com/">
            <CImage src={huntressLogo} alt="Huntress" />
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
