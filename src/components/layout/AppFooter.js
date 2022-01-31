import React from 'react'
import { CFooter, CImage } from '@coreui/react'
import huntressLogo from 'src/assets/images/huntress_teal.png'

const AppFooter = () => {
  return (
    <CFooter>
      <p className="white-text">
        This application is sponsored by <CImage src={huntressLogo} height={30} alt="Logo" />
      </p>
    </CFooter>
  )
}

export default React.memo(AppFooter)
