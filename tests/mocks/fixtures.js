// producer-contract fixtures shared across test files. only shapes that mirror
// a real api contract belong here, per-test branch data stays in the test file.

// /.auth/me and /api/me principal shapes (swa wrapper vs cipp role payload)
export const swaPrincipal = (userDetails = 'john@contoso.com') => ({
  clientPrincipal: { userDetails, userRoles: ['anonymous', 'authenticated'] },
})

export const cippPrincipal = (userRoles, userDetails = 'john@contoso.com') => ({
  clientPrincipal: { userDetails, userRoles },
})

// ListTenants rows as the tenant selectors consume them
export const tenantsContosoFabrikam = [
  {
    displayName: 'Contoso',
    defaultDomainName: 'contoso.com',
    customerId: '11111111-aaaa-bbbb-cccc-000000000001',
    initialDomainName: 'contoso.onmicrosoft.com',
  },
  {
    displayName: 'Fabrikam',
    defaultDomainName: 'fabrikam.com',
    customerId: '22222222-aaaa-bbbb-cccc-000000000002',
    initialDomainName: 'fabrikam.onmicrosoft.com',
  },
]
