import { applyReportVariables } from '../components/CippPdf/reportTheme'

// Offered by the % popup on the template fields (CippFormComponent forwards autocompleteOptions to
// CippTextFieldWithVariables). Replaces the tenant/system list, which nothing resolves in JIT flows.
const TECHNICIAN = {
  name: 'cipptechnician',
  variable: '%cipptechnician%',
  description: "Signed-in technician's account name before the @",
  type: 'reserved',
  category: 'cipp',
}
const TECHNICIAN_UPN = {
  name: 'cipptechnicianupn',
  variable: '%cipptechnicianupn%',
  description: "Signed-in technician's full account name",
  type: 'reserved',
  category: 'cipp',
}
// Username gets the domain appended by the backend, so the full UPN is not offered there.
export const JIT_USERNAME_VARIABLES = [TECHNICIAN]
export const JIT_TEMPLATE_VARIABLES = [TECHNICIAN, TECHNICIAN_UPN]

// Technician tokens for JIT Admin templates (#298). Resolved in the browser when a template is
// applied, so the requester sees the final username before submitting. Unknown %tokens% stay as
// written, same as applyReportVariables and Get-CIPPTextReplacement.
export const resolveJitTemplateVariables = (text, upn) => {
  if (!text) return text
  return applyReportVariables(text, {
    cipptechnician: upn?.split('@')[0] ?? '',
    cipptechnicianupn: upn ?? '',
  })
}
