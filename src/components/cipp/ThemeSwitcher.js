import React from 'react'
import { CButtonGroup, CButton, CCardTitle, CCard, CCardBody } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTheme } from 'src/store/modules/app'

function caps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const ThemeSwitcher = () => {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.app.currentTheme)
  const themes = useSelector((state) => state.app.themes)

  const SwitchTheme = (t) => {
    dispatch(setCurrentTheme({ theme: t }))
    document.body.classList = []
    document.body.classList.add(t)
  }

  return (
    <CCard style={{ width: '18rem' }} className="p-2">
      <CCardBody>
        <CCardTitle>Select Theme</CCardTitle>
      </CCardBody>
      <CButtonGroup role="group" aria-label="Basic example">
        {themes.map((t, index) => (
          <CButton
            onClick={() => SwitchTheme(t)}
            color={t === theme ? 'primary' : 'secondary'}
            key={index}
          >
            {caps(t)}
          </CButton>
        ))}
      </CButtonGroup>
    </CCard>
  )
}

export default ThemeSwitcher
