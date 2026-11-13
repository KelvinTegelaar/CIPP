import { useEffect, useState } from 'react'
import { Button, TextField, Typography } from '@mui/material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'

const CippDomainExclusionSettings = () => {
  const dnsSetting = ApiGetCall({
    url: '/api/ExecDnsConfig?Action=GetConfig',
    queryKey: 'DNSSettings',
  })
  const saveExclusions = ApiPostCall({
    relatedQueryKeys: ['DNSSettings', 'ListDomains*'],
  })
  const [patterns, setPatterns] = useState('')

  useEffect(() => {
    setPatterns((dnsSetting.data?.ExclusionPatterns ?? []).join('\n'))
  }, [dnsSetting.data])

  return (
    <CippButtonCard
      title="Domain Analyser Exclusions"
      cardSx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      CardButton={
        <Button
          variant="contained"
          size="small"
          disabled={saveExclusions.isPending || dnsSetting.isLoading}
          onClick={() =>
            saveExclusions.mutate({
              url: '/api/ExecDnsConfig?Action=SetConfig',
              data: { ExclusionPatterns: patterns },
            })
          }
        >
          Save
        </Button>
      }
    >
      <Typography variant="body2" sx={{ mb: 2 }}>
        Domains matching these patterns are left out of the Domains Analyser and
        the DKIM baseline for every tenant, such as Teams telephony or SBC
        domains. One pattern per line, * is a wildcard. Matching domains are
        removed at the next analyser run.
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        size="small"
        placeholder={'*.voice.example.com\n*.sbcprovider.uk'}
        value={patterns}
        onChange={(e) => setPatterns(e.target.value)}
        disabled={dnsSetting.isLoading}
      />
      <CippApiResults apiObject={saveExclusions} />
    </CippButtonCard>
  )
}

export default CippDomainExclusionSettings
