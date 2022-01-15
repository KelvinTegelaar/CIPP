import React from 'react'
import { CButtonGroup, CButton, CCard, CCardHeader } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTheme } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'

function caps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const ThemeSwitcher = () => {
  const dispatch = useDispatch()
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const theme = useSelector((state) => state.app.currentTheme) || preferredTheme
  const themes = useSelector((state) => state.app.themes)

  const SwitchTheme = (t) => {
    dispatch(setCurrentTheme({ theme: t }))
    document.body.classList = []
    document.body.classList.add(`theme-${t}`)
    document.body.dataset.theme = t
  }

  return (
    <CCard>
      <CCardHeader>Select Theme</CCardHeader>
      <CButtonGroup role="group" aria-label="Theme Switcher">
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
