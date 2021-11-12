import React from 'react'
import { useSelector } from 'react-redux'

const Profile = () => {
  const profile = useSelector((state) => state.profile)
  return <div>{JSON.stringify(profile)}</div>
}

export default Profile
