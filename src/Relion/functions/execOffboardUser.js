import axios from 'axios'

const execOffboardUser = async (defaultDomainName, contactEmail, delegateEmail = '') => {
  const convertToShared = delegateEmail ? true : false
  const disableSignIn = delegateEmail ? false : true
  const data = JSON.stringify({
    TenantFilter: defaultDomainName,
    AccessAutomap: '',
    AccessNoAutomap: delegateEmail,
    ConvertToShared: convertToShared,
    DisableSignIn: disableSignIn,
    OOO: '',
    OnedriveAccess: '',
    RemoveGroups: true,
    RemoveLicenses: true,
    ResetPass: false,
    RevokeSessions: true,
    deleteuser: false,
    forward: '',
    removeMobile: true,
    removeRules: false,
    user: contactEmail,
  })

  const axiosParam = {
    method: 'post',
    url: `/api/ExecOffboardUser`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  }
  console.log(axiosParam)
  const response = await axios(axiosParam)

  return response.data.Results
}

export default execOffboardUser
