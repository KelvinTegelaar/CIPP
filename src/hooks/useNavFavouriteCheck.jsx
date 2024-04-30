import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import routes from 'src/routes'

export const useNavFavouriteCheck = (navigation) => {
  const favourites = useSelector((state) => state.app.userSettingsDefaults?.favourites)
  const recentPages = useSelector((state) => state.app.recentPages)
  const newNavigation = [{ component: CNavTitle, name: 'Home' }]
  if (Array.isArray(favourites)) {
    newNavigation.push({
      component: CNavGroup,
      section: 'favourites',
      name: 'Favourites',
      to: '/favorites',
      icon: <FontAwesomeIcon icon={'star'} className="nav-icon" />,
      items: favourites.map((item) => {
        //console.log(item)
        return {
          name: item.value.name,
          to: item.value.to,
          component: CNavItem,
        }
      }),
    })
  }
  if (Array.isArray(recentPages)) {
    var items = []

    recentPages.map((path) => {
      const item = routes.find((route) => route.path.toLowerCase() === path.toLowerCase())
      if (item?.path) {
        items.push({
          name: item.name,
          to: item.path,
          component: CNavItem,
        })
      }
    })
    if (items.length > 0) {
      items = items.slice(0, 5)
      newNavigation.push({
        component: CNavGroup,
        section: 'recent',
        name: 'Recent Pages',
        to: '/recent',
        icon: <FontAwesomeIcon icon={'history'} className="nav-icon" />,
        items: items,
      })
    }
  }
  newNavigation.push(...navigation)

  return newNavigation
}
