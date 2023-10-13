import React from 'react'
import { CButton, CCol, CRow } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTheme } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function themeInfo(theme) {
  switch (theme) {
    case 'impact':
      return {
        name: 'Impact',
        description: 'Dark Theme',
      }
    case 'cyberdrain':
      return {
        name: 'CyberDrain',
        description: 'Light Theme',
      }
    default:
      return {
        name: 'Default',
        description: 'Default uses your browser preferences to determine the theme.',
      }
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
    <>
      <CRow>
        <label className="mb-3">Select Theme:</label>
      </CRow>
      <CRow>
        <CCol className="mb-3">
          {themes.map((theme, index) => (
            <CButton
              onClick={() => SwitchTheme(theme)}
              className={`circular-button ${theme} ${theme === currentTheme ? 'round-focus' : ''}`}
              key={index}
              title={themeInfo(theme).description}
            >
              {theme === 'default' && 'D'}
              {theme === 'cyberdrain' && <FontAwesomeIcon icon={'sun'} color="#f77f00" />}
              {theme === 'impact' && <FontAwesomeIcon icon={'moon'} color="#f77f00" />}
            </CButton>
          ))}
        </CCol>
      </CRow>
    </>
  )
}

export default ThemeSwitcher
