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

  const RoB = isDark ? '/img/RoB.svg' : '/img/RoB-light.svg'
  const huntress = isDark ? '/img/huntress_teal.png' : '/img/huntress_teal.png'
  const rewst = isDark ? '/img/rewst_dark.png' : '/img/rewst.png'
  const ninjaone = isDark ? '/img/ninjaone_dark.png' : '/img/ninjaone.png'
  const augmentt = isDark ? '/img/augmentt-dark.png' : '/img/augmentt-light.png'

  return (
    <CFooter className="d-flex justify-content-between align-items-center stickyfooter">
      <div className="sponsors">
        <p>
          This application is sponsored by
          <CLink className="mx-2" href="https://www.huntress.com/" target="_blank">
            <CImage src={huntress} alt="Huntress" />
          </CLink>
          <CLink
            className="me-2"
            href="https://www.rightofboom.com/rob-2025/register?promo=EarlyBird2025#register"
            target="_blank"
          >
            <CImage src={RoB} alt="RoB" />
          </CLink>
          <CLink className="me-2" href="https://rewst.io/" target="_blank">
            <CImage src={rewst} alt="Rewst" />
          </CLink>
          <CLink
            className="me-1"
            href="https://www.augmentt.com/?utm_source=cipp&utm_medium=referral&utm_campaign=2024"
            target="_blank"
          >
            <CImage src={augmentt} alt="Augmentt" />
          </CLink>
          <CLink className="me-1" href="https://ninjaone.com" target="_blank">
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
