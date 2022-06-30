import axios from 'axios'
import { wordle } from './wordle'

const getPassword = async () => {
  // generate random Wordle from imported array
  const randomWordle = wordle[Math.floor(Math.random() * wordle.length)]
  const randomWordleCap = randomWordle.charAt(0).toUpperCase() + randomWordle.slice(1)

  // generate random Wordle rhyme
  const axiosParam = {
    method: 'get',
    url: `https://rhymebrain.com/talk?function=getRhymes&word=${randomWordle}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const response = await axios(axiosParam)
  const rhymeList = response.data
  // pick 5 or 6 letter words and exclude low frequency words (obscure)
  const rhymeLen5 = rhymeList.filter(
    (list) => list.word.length >= 5 && list.word.length <= 6 && list.freq > 13,
  )
  const randomRhyme = rhymeLen5[Math.floor(Math.random() * rhymeLen5.length)]
  const randomRhymeCap = randomRhyme.word.charAt(0).toUpperCase() + randomRhyme.word.slice(1)
  console.log('Random Rhyme:')
  console.log(randomRhyme)

  // generate two digits
  const randomNo1 = Math.floor(Math.random() * 9)
  const randomNo2 = Math.floor(Math.random() * 9)

  const password = randomWordleCap + randomRhymeCap + randomNo1 + randomNo2
  return password
}

export default getPassword
