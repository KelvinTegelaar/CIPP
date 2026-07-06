import { Alert, Stack, Typography } from '@mui/material'
import { CippCodeBlock } from './CippCodeBlock'

// Decode the stored FileDataBase64 (UTF-16LE rule pack bytes) back into XML for exploring.
const decodeFileData = (b64) => {
  try {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    let xml = new TextDecoder('utf-16le').decode(bytes)
    if (!xml.includes('<RulePackage')) {
      xml = new TextDecoder('utf-8').decode(bytes)
    }
    return xml
  } catch {
    return null
  }
}

// Parse the rule pack XML into a friendly detection config (mirrors the backend ConvertTo-CIPPSitComparable):
// entity name -> { confidence, proximity, description, patterns:[{ level, matches:[regex:.. / keyword:.. ] }] }.
const parseSitConfig = (xml) => {
  try {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    if (doc.getElementsByTagName('parsererror').length) return null
    const all = Array.from(doc.getElementsByTagName('*'))
    const byLocal = (name) => all.filter((n) => n.localName === name)

    const regexMap = {}
    byLocal('Regex').forEach((n) => {
      if (n.getAttribute('id')) regexMap[n.getAttribute('id')] = (n.textContent || '').trim()
    })
    const keywordMap = {}
    byLocal('Keyword').forEach((n) => {
      if (!n.getAttribute('id')) return
      const terms = Array.from(n.getElementsByTagName('*'))
        .filter((t) => t.localName === 'Term')
        .map((t) => (t.textContent || '').trim())
        .sort()
      keywordMap[n.getAttribute('id')] = terms.join('|')
    })
    const resMap = {}
    byLocal('Resource').forEach((res) => {
      const idRef = res.getAttribute('idRef')
      if (!idRef) return
      const kids = Array.from(res.children)
      resMap[idRef] = {
        name: kids.find((c) => c.localName === 'Name')?.textContent?.trim() || '',
        description: kids.find((c) => c.localName === 'Description')?.textContent?.trim() || '',
      }
    })

    const config = {}
    all
      .filter((n) => n.localName === 'Entity' || n.localName === 'Affinity')
      .forEach((ent) => {
        const eid = ent.getAttribute('id')
        const name = resMap[eid]?.name || eid
        const patterns = Array.from(ent.getElementsByTagName('*'))
          .filter((p) => p.localName === 'Pattern' || p.localName === 'Evidence')
          .map((p) => {
            const matches = Array.from(p.getElementsByTagName('*'))
              .filter((m) => m.getAttribute('idRef'))
              .map((m) => {
                const ref = m.getAttribute('idRef')
                if (regexMap[ref] !== undefined) return `regex:${regexMap[ref]}`
                if (keywordMap[ref] !== undefined) return `keyword:${keywordMap[ref]}`
                return `fingerprint:${ref}`
              })
              .sort()
            return { level: p.getAttribute('confidenceLevel') || '', matches }
          })
        config[name] = {
          confidence:
            ent.getAttribute('recommendedConfidence') || ent.getAttribute('thresholdConfidenceLevel') || '',
          proximity: ent.getAttribute('patternsProximity') || ent.getAttribute('evidencesProximity') || '',
          description: resMap[eid]?.description || '',
          patterns,
        }
      })
    return config
  } catch {
    return null
  }
}

// More-info panel for a Sensitive Information Type template: explore the captured rule pack data.
export const CippSitTemplateDetails = ({ row }) => {
  const isAdvanced = Boolean(row?.FileDataBase64)
  const xml = isAdvanced ? decodeFileData(row.FileDataBase64) : null
  const config = xml ? parseSitConfig(xml) : null

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {isAdvanced
          ? 'Advanced template — the captured rule pack is stored as base64. The decoded detection config and XML below are exactly what gets deployed.'
          : 'Simple template — the backend synthesizes a rule pack from this pattern at deploy time.'}
      </Typography>

      {!isAdvanced && row?.Pattern && (
        <CippCodeBlock
          code={JSON.stringify(
            {
              Name: row?.name ?? row?.Name,
              Pattern: row.Pattern,
              Confidence: row?.Confidence,
              PatternsProximity: row?.PatternsProximity,
              Locale: row?.Locale,
            },
            null,
            2,
          )}
          language="json"
          type="syntax"
        />
      )}

      {isAdvanced && config && Object.keys(config).length > 0 && (
        <>
          <Typography variant="subtitle2">Detection configuration</Typography>
          <CippCodeBlock code={JSON.stringify(config, null, 2)} language="json" type="syntax" />
        </>
      )}

      {isAdvanced && xml && (
        <>
          <Typography variant="subtitle2">Rule pack XML (decoded from base64)</Typography>
          <CippCodeBlock code={xml} language="xml" type="editor" readOnly editorHeight="450px" />
        </>
      )}

      {isAdvanced && !xml && (
        <Alert severity="warning" variant="outlined">
          Could not decode the stored rule pack data.
        </Alert>
      )}
    </Stack>
  )
}
