import React from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { Form } from 'react-final-form'
import { Condition, RFFCFormInput, RFFCFormSelect, RFFCFormSwitch } from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { faCheck, faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage } from 'src/components/layout'
import { useSelector } from 'react-redux'
import { ModalService } from 'src/components/utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Skeleton from 'react-loading-skeleton'
import { CippTable } from 'src/components/tables'
import allStandardsList from 'src/data/standards'

const RefreshAction = () => {
  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to run the standards now? <br />
          <i>Please note: this runs every three hours automatically.</i>
        </div>
      ),
      onConfirm: () => execStandards({ path: 'api/Standards_OrchestrationStarter' }),
    })

  return (
    <>
      {execStandardsResults.data?.Results ===
        'Already running. Please wait for the current instance to finish' && (
        <div> {execStandardsResults.data?.Results}</div>
      )}
      <CButton onClick={showModal} size="sm" className="m-1">
        {execStandardsResults.isLoading && <CSpinner size="sm" />}
        {execStandardsResults.error && (
          <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
        )}
        {execStandardsResults.isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
        Run Standards Now
      </CButton>
    </>
  )
}
const DeleteAction = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: <div>Are you sure you want to delete this standard?</div>,
      onConfirm: () => execStandards({ path: `api/RemoveStandard?ID=${tenantDomain}` }),
    })

  return (
    <>
      <CButton onClick={showModal}>
        {execStandardsResults.isLoading && <CSpinner size="sm" />}
        {execStandardsResults.error && (
          <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
        )}
        Delete Standard
      </CButton>
      {execStandardsResults.isSuccess && (
        <CCallout color="success">{execStandardsResults.data.Results}</CCallout>
      )}
    </>
  )
}
const ListAppliedStandards = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const { data: listStandardsAllTenants = [] } = useGenericGetRequestQuery({
    path: 'api/listStandards',
  })

  const {
    data: listStandardResults = [],
    isFetching,
    isSuccess,
  } = useGenericGetRequestQuery({
    path: 'api/listStandards',
    params: { TenantFilter: tenantDomain },
  })

  const handleSubmit = async (values) => {
    // @todo: clean this up api sided so we don't need to perform weird tricks.
    Object.keys(values.standards).filter(function (x) {
      if (values.standards[x] === false) {
        delete values.standards[x]
      }
      return null
    })

    values.standards[`Select_${tenantDomain}`] = tenantDomain

    //filter on only objects that are 'true'
    genericPostRequest({ path: '/api/AddStandardsDeploy', values: values.standards })
  }
  const tableColumns = [
    {
      name: 'Tenant',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Applied Standards',
      selector: (row) => row['StandardsExport'],
      sortable: true,
      exportSelector: 'StandardsExport',
    },
  ]

  return (
    <CippPage title="Standards" tenantSelector={false}>
      <>
        {postResults.isSuccess && <CCallout color="success">{postResults.data?.Results}</CCallout>}
        <CRow>
          <CCol lg={6} xs={12}>
            <CippContentCard
              button={
                <>
                  <RefreshAction className="justify-content-end" key="refresh-action-button" />
                </>
              }
              title="List and edit standard"
            >
              {isFetching && <Skeleton count={20} />}
              {isSuccess && !isFetching && (
                <Form
                  initialValues={listStandardResults[0]}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <hr />
                        {listStandardResults[0].appliedBy
                          ? `This standard has been applied at ${listStandardResults[0].appliedAt} by ${listStandardResults[0].appliedBy}`
                          : 'This tenant does not yet have a standard applied'}
                        <hr />
                        <h5>Global Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'Global')
                            .map((item, key) => (
                              <>
                                <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                                {item.addedComponent && (
                                  <Condition when={item.name} is={true}>
                                    {item.addedComponent.type === 'Select' ? (
                                      <RFFCFormSelect
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                        values={item.addedComponent.values}
                                      />
                                    ) : (
                                      <RFFCFormInput
                                        type="text"
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                      />
                                    )}
                                  </Condition>
                                )}
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>Azure AD Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'AAD')
                            .map((item, key) => (
                              <>
                                <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                                {item.addedComponent && (
                                  <Condition when={item.name} is={true}>
                                    {item.addedComponent.type === 'Select' ? (
                                      <RFFCFormSelect
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                        values={item.addedComponent.values}
                                      />
                                    ) : (
                                      <RFFCFormInput
                                        type="text"
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                      />
                                    )}
                                  </Condition>
                                )}
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>Exchange Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'Exchange')
                            .map((item, key) => (
                              <>
                                <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                                {item.addedComponent && (
                                  <Condition when={item.name} is={true}>
                                    {item.addedComponent.type === 'Select' ? (
                                      <RFFCFormSelect
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                        values={item.addedComponent.values}
                                      />
                                    ) : (
                                      <RFFCFormInput
                                        type="text"
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                      />
                                    )}
                                  </Condition>
                                )}
                              </>
                            ))}
                        </CRow>
                        <hr />
                        <h5>SharePoint Standards</h5>
                        <hr />
                        <CRow className="mb-3" xs={{ cols: 2 }}>
                          {allStandardsList
                            .filter((obj) => obj.cat === 'SharePoint')
                            .map((item, key) => (
                              <>
                                <RFFCFormSwitch key={key} name={item.name} label={item.label} />
                                {item.addedComponent && (
                                  <Condition when={item.name} is={true}>
                                    {item.addedComponent.type === 'Select' ? (
                                      <RFFCFormSelect
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                        values={item.addedComponent.values}
                                      />
                                    ) : (
                                      <RFFCFormInput
                                        type="text"
                                        name={item.addedComponent.name}
                                        label={item.addedComponent.label}
                                      />
                                    )}
                                  </Condition>
                                )}
                              </>
                            ))}
                        </CRow>
                        {postResults.isSuccess && (
                          <CCallout color="success">{postResults.data.Results}</CCallout>
                        )}
                        <CRow className="mb-3">
                          <CCol md={6}>
                            <CButton type="submit" disabled={submitting}>
                              Save
                              {postResults.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="ms-2"
                                  size="1x"
                                />
                              )}
                            </CButton>
                          </CCol>
                          <CCol md={6} className="d-flex flex-row-reverse">
                            {listStandardResults[0].appliedBy && (
                              <DeleteAction key="deleteAction" />
                            )}
                          </CCol>
                        </CRow>
                      </CForm>
                    )
                  }}
                />
              )}
            </CippContentCard>
          </CCol>
          <CCol lg={6} xs={12}>
            {listStandardsAllTenants && (
              <CippContentCard title="Currently Applied Standards">
                <CippTable
                  reportName={`Standards`}
                  data={listStandardsAllTenants}
                  columns={tableColumns}
                />
              </CippContentCard>
            )}
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListAppliedStandards
