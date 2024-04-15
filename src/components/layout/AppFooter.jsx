import React from 'react'
import { CFooter, CImage, CLink } from '@coreui/react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMediaPredicate } from 'react-media-hook'

const AppFooter = () => {
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const isDark =
    currentTheme === 'impact' || (currentTheme === 'default' && preferredTheme === 'impact')

  const netfriends = isDark ? '/img/netfriends_dark.png' : '/img/netfriends.png'
  const datto = isDark ? '/img/datto.png' : '/img/datto.png'
  const huntress = isDark ? '/img/huntress_teal.png' : '/img/huntress_teal.png'
  const rewst = isDark ? '/img/rewst_dark.png' : '/img/rewst.png'
  const ninjaone = isDark ? '/img/ninjaone_dark.png' : '/img/ninjaone.png'

  return (
    <CFooter className="d-flex justify-content-between align-items-center stickyfooter">
      <div className="sponsors">
        <p>
          This application is sponsored by
          <CLink className="me-2" href="https://www.huntress.com/">
            <CImage src={huntress} alt="Huntress" />
          </CLink>
          <CLink className="me-2" href="https://datto.com/">
            <CImage src={datto} alt="Datto" />
          </CLink>
          <CLink className="me-2" href="https://rewst.io/">
            <CImage src={rewst} alt="Rewst" />
          </CLink>
          <CLink className="me-2" href="https://netfriends.com">
            <CImage src={netfriends} alt="Netfriends" />
          </CLink>
          <CLink className="me-2" href="https://ninjaone.com">
            <CImage src={ninjaone} alt="NinjaOne" />
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
