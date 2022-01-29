import React from 'react'
import { CButtonGroup, CButton, CCard, CCardHeader } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTheme } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'

function themeDisplayName(theme) {
  switch (theme) {
    case 'impact':
      return 'Impact'
    case 'cyberdrain':
      return 'CyberDrain'
    default:
      return 'Default'
  }
}

const ThemeSwitcher = () => {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const themes = useSelector((state) => state.app.themes)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const SwitchTheme = (inputTheme) => {
    var targetTheme
    if (inputTheme === 'default') {
      targetTheme = preferredTheme
    } else {
      targetTheme = inputTheme
    }
    dispatch(setCurrentTheme({ theme: inputTheme }))
    document.body.classList = []
    document.body.classList.add(`theme-${targetTheme}`)
    document.body.dataset.theme = targetTheme
  }

  return (
    <CCard>
      <CCardHeader>Select Theme</CCardHeader>
      <CButtonGroup role="group" aria-label="Theme Switcher" color="secondary">
        {themes.map((theme, index) => (
          <CButton
            onClick={() => SwitchTheme(theme)}
            active={theme === currentTheme ? true : false}
            color="secondary"
            key={index}
          >
            {themeDisplayName(theme)}
          </CButton>
        ))}
      </CButtonGroup>
    </CCard>
  )
}

export default ThemeSwitcher
