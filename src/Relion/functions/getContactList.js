import axios from 'axios'
import getToken from './getToken'

const getContactList = async (clientID) => {
  let page = 1
  let itemCount = 0
  let arr = []

  do {
    //if the page is full (100 items), go to next page and merge results

    console.log(`page: ${page}`)

    const axiosParam = {
      method: 'get',
      url: `https://api.bms.kaseya.com/v2/crm/accounts/${clientID}/contacts/lookup?PageNumber=${page}`,
      headers: {
        Authorization: await getToken(),
        'Content-Type': 'application/json',
      },
    }
    const response = await axios(axiosParam)
    const result = response.data.result

    //merge result into array
    Array.prototype.push.apply(arr, result)
    console.log(arr)

    itemCount = result.length
    page++
  } while (itemCount === 100)

  //reformat array for MUI dropdown
  const contactList = arr.map((item) => {
    return { label: item.name, id: item.id, email: item.emailAddress }
  })
  return contactList
}

export default getContactList
