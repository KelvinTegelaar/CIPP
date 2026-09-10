import { http, HttpResponse } from 'msw'
import users1k from './users-1k.json'

export const handlers = [
  http.get('/api/ListUsers', () => {
    return HttpResponse.json({
      Results: users1k,
      Metadata: { nextLink: null },
    })
  }),
  http.get('/api/me', () => {
    return HttpResponse.json({ message: 'Permission Denied' })
  }),
  http.get('/.auth/me', () => {
    return HttpResponse.json({ clientPrincipal: null })
  }),
  http.get('/api/ListGraphExplorerPresets', () => {
    return HttpResponse.json({ Results: [] })
  }),
  http.get('/api/listTenants', () => {
    return HttpResponse.json([
      {
        GraphErrorCount: 0,
        customerId: 'AllTenants',
        defaultDomainName: 'AllTenants',
        displayName: '*All Tenants',
        domains: 'AllTenants',
      },
      {
        ETag: 'W/"datetime\'2026-03-26T09%3A06%3A25.73369Z\'"',
        ExcludeDate: '',
        ExcludeUser: '',
        Excluded: false,
        GraphErrorCount: 0,
        LastGraphError: '',
        LastRefresh: '2026-03-26T09:06:25.7304935+00:00',
        PartitionKey: 'Tenants',
        RequiresRefresh: false,
        RowKey: '12345678-1234-1234-1234-123456789012',
        Timestamp: '2026-03-26T09:06:25.73369+00:00',
        customerId: '12345678-1234-1234-1234-123456789012',
        defaultDomainName: 'your-domain.com',
        displayName: '*Partner Tenant',
        domains: 'PartnerTenant',
        initialDomainName: 'your-domain.onmicrosoft.com',
      },
      {
        ETag: 'W/"datetime\'2026-03-26T09%3A01%3A48.7760351Z\'"',
        ExcludeDate: '',
        ExcludeUser: '',
        Excluded: false,
        GraphErrorCount: 0,
        LastGraphError: '',
        LastRefresh: '2026-03-25T23:00:19.7744621+00:00',
        PartitionKey: 'Tenants',
        RequiresRefresh: true,
        RowKey: '12345678-1234-1234-1234-123456789012',
        Timestamp: '2026-03-26T09:01:48.7760351+00:00',
        customerId: '12345678-1234-1234-1234-123456789012',
        defaultDomainName: 'customer.com',
        delegatedPrivilegeStatus: 'granularDelegatedAdminPrivileges',
        displayName: 'Customer 1',
        domains: '',
        hasAutoExtend: true,
        initialDomainName: 'customer1.onmicrosoft.com',
        relationshipCount: 1,
        relationshipEnd: '2026-08-20T15:38:34.1707858+00:00',
      },
    ])
  }),
]
