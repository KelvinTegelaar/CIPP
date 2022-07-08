import { useDispatch } from 'react-redux'
import { useLoadClientPrincipalQuery } from '../../../store/api/auth'
import { setTechId } from '../../store/features/ticketFormSlice'

export default function GetTechId() {
  const dispatch = useDispatch()
  const { data: profile } = useLoadClientPrincipalQuery()
  const currentUser = profile.clientPrincipal.userDetails
  const techList = [
    { id: 51085, user: 'alex@thinkrelion.com' },
    { id: 48017, user: 'brian@thinkrelion.com' },
    { id: 48221, user: 'carlos@thinkrelion.com' },
    { id: 51084, user: 'jeremy@thinkrelion.com' },
    { id: 51083, user: 'zach@thinkrelion.com' },
  ]
  const bmsUser = techList.find((item) => item.user === currentUser)
  dispatch(setTechId(bmsUser.id))

  return null
}
