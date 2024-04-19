import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'

export const useNavFavouriteCheck = (navigation) => {
  const favourites = useSelector((state) => state.app.userSettingsDefaults?.favourites)

  if (Array.isArray(favourites)) {
    const newNavigation = [
      { component: CNavTitle, name: 'Favourites' },
      {
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
      },
      { component: CNavTitle, name: 'Dashboard' },
      ...navigation,
    ]
    return newNavigation
  }
  return navigation
}
