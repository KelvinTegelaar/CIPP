import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { Button, Chip, Stack, Typography } from '@mui/material'
import { wordle } from '../functions/wordle'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { setNotes } from '../store/features/ticketSlice'

export default function ResetPass() {
  const dispatch = useDispatch()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const contactAZ = useSelector((state) => state.az.contactAZ)
  const tenant = useSelector((state) => state.app.currentTenant)
  const [pass1, setPass1] = useState()
  const [pass2, setPass2] = useState()
  const [pass3, setPass3] = useState()
  const [password, setPassword] = useState()
  const [index1, setIndex1] = useState(0)
  const [index2, setIndex2] = useState(0)
  const [index3, setIndex3] = useState(0)
  const [rhymeFiltered, setRhymeFiltered] = useState([{ word: '...' }])
  const [rhymeCount, setRhymeCount] = useState(0)

  // first part of the password is a random Wordle
  useEffect(() => {
    const randomWordle = wordle[Math.floor(Math.random() * wordle.length)]
    const randomWordleCap = randomWordle.charAt(0).toUpperCase() + randomWordle.slice(1)
    setPass1(randomWordleCap)
    setIndex2(0)
  }, [index1])

  // second part of the password is a word that rhymes with the Wordle
  useEffect(() => {
    const fetchData = async () => {
      const axiosParam = {
        method: 'get',
        url: `https://rhymebrain.com/talk?function=getRhymes&word=${pass1}`,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const response = await axios(axiosParam)
      const rhymeList = response.data
      // pick high quality rhymes between 5 to 8 letters
      const filtered = rhymeList.filter(
        (list) =>
          list.score >= 300 &&
          list.freq >= 16 &&
          list.word.length >= 5 &&
          list.word.length <= 8 &&
          list.word !== pass1.toLowerCase(),
      )

      // shuffle to make the rhymes random
      // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
      let shuffled = filtered
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

      if (shuffled.length > 0) {
        setRhymeFiltered(shuffled)
        setRhymeCount(shuffled.length)
      } else {
        setRhymeFiltered([{ word: '...' }])
        setRhymeCount(0)
      }
    }

    fetchData().catch((error) => {
      console.log(error)
      setPass2('...')
      setRhymeCount(0)
    })
  }, [pass1])

  useEffect(() => {
    console.log(`Rhyme Index/Count: ${index2}/${rhymeCount}`)
    console.log(rhymeFiltered)

    const rhyme = rhymeFiltered[index2].word
    const rhymeCap = rhyme.charAt(0).toUpperCase() + rhyme.slice(1)
    setPass2(rhymeCap)
  }, [rhymeFiltered, rhymeCount, index2])

  // cycle through the rhyme index
  const pass2Handler = () => {
    if (index2 + 1 === rhymeCount || rhymeCount === 0) {
      setIndex2(0)
    } else {
      setIndex2(index2 + 1)
    }
  }

  // last part of the password is two random digits
  useEffect(() => {
    const randomNo1 = Math.floor(Math.random() * 9)
    const randomNo2 = Math.floor(Math.random() * 9)
    setPass3(randomNo1.toString() + randomNo2.toString())
  }, [index3])

  // combine all three password pieces together
  useEffect(() => {
    setPassword(pass1 + pass2 + pass3)
  }, [pass1, pass2, pass3])

  const resetHandler = () => {
    const shippedValues = {
      DisplayName: contactAZ.displayName,
      Password: password,
      UserID: contactAZ.id,
      tenantID: tenant.defaultDomainName,
      mustchangepass: false,
    }
    console.log(shippedValues)
    genericPostRequest({ path: '/api/NewPassphrase', values: shippedValues })
  }

  const fetchResult = () => {
    if (postResults.isFetching) {
      return <Typography color="success">Loading...</Typography>
    } else if (postResults.isSuccess) {
      dispatch(
        setNotes(
          `${contactAZ.displayName}'s new login: ${contactAZ.userPrincipalName} / ${password}`,
        ),
      )
      return (
        <Typography color="success">
          {postResults.data.Results.map((message, idx) => {
            return <li key={idx}>{message}</li>
          })}
        </Typography>
      )
    } else {
      return null
    }
  }

  const handleDelete = () => {
    console.info('You clicked the delete icon.')
  }

  return (
    <>
      <Stack direction="row" spacing={0}>
        <Button onClick={resetHandler}>Reset Password =</Button>
        <Chip
          label={pass1}
          variant="outlined"
          color="primary"
          onClick={() => setIndex1(index1 + 1)}
          onDelete={handleDelete}
        />
        <Chip label={pass2} variant="outlined" color="success" onClick={pass2Handler} />
        <Typography>
          <sup>{rhymeCount}</sup>
        </Typography>
        <Chip label={pass3} variant="outlined" color="info" onClick={() => setIndex3(index3 + 1)} />
      </Stack>
      <br />
      {fetchResult()}
      <Typography></Typography>
    </>
  )
}
