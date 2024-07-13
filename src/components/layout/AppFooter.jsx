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

  const datto = isDark ? '/img/datto.png' : '/img/datto.png'
  const huntress = isDark ? '/img/huntress_teal.png' : '/img/huntress_teal.png'
  const rewst = isDark ? '/img/rewst_dark.png' : '/img/rewst.png'
  const ninjaone = isDark ? '/img/ninjaone_dark.png' : '/img/ninjaone.png'
  const augmentt = isDark ? '/img/augmentt-dark.png' : '/img/augmentt-light.png'

  return (
    <CFooter className="d-flex justify-content-between align-items-center stickyfooter">
      <div className="sponsors">
        <p> </p>
      </div>
      <nav className="footer-nav"> </nav>
    </CFooter>
  )
}

export default React.memo(AppFooter)
