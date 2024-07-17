import React, { useEffect, useState } from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import countryList from 'src/data/countryList'
import useQuery from 'src/hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFSelectSearch } from 'src/components/forms'
import { useListContactsQuery } from 'src/store/api/users'
import { CippCodeBlock, ModalService } from 'src/components/utilities'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage } from 'src/components/layout'
import { required } from 'src/validators'

const EditContact = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const ContactID = query.get('ContactID')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const {
    data: Contact = [],
    isFetching: ContactIsFetching,
    error: ContactError,
  } = useListContactsQuery({ tenantDomain, ContactID })

  useEffect(() => {
    if (!ContactID || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested contact.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [ContactID, tenantDomain, dispatch])
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    if (values.defaultAttributes) {
      //map default attributes to the addedAttributes array. If addedAttributes is not present, create it.
      values.addedAttributes = values.addedAttributes ? values.addedAttributes : []
      Object.keys(values.defaultAttributes).forEach((key) => {
        values.addedAttributes.push({ Key: key, Value: values.defaultAttributes[key].Value })
      })
    }
    const countryValue = values.country ? values.country.value : ''

    const shippedValues = {
      BusinessPhone: values.businessPhones,
      City: values.city,
      CompanyName: values.companyName,
      Country: countryValue,
      mail: values.mail,
      DisplayName: values.displayName,
      firstName: values.givenName,
      Jobtitle: values.jobTitle,
      LastName: values.surname,
      MobilePhone: values.mobilePhone,
      PostalCode: values.postalCode,
      ContactID: ContactID,
      streetAddress: values.streetAddress,
      tenantID: tenantDomain,
    }
    // window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/EditContact', values: shippedValues })
  }
  const [addedAttributes, setAddedAttribute] = React.useState(0)
  const currentSettings = useSelector((state) => state.app)
  const country = useSelector((state) => state.app.usageLocation)

  // Extract the first contact from the array
  const contactData = Contact.length > 0 ? Contact[0] : {}

  // Extract address and phone details
  const address =
    contactData.addresses && contactData.addresses.length > 0 ? contactData.addresses[0] : {}
  const mobilePhone = contactData.phones
    ? contactData.phones.find((phone) => phone.type === 'mobile')
    : {}
  const businessPhones = contactData.phones
    ? contactData.phones
        .filter((phone) => phone.type === 'business')
        .map((phone) => phone.number)
        .join(', ')
    : ''

  const initialState = {
    ...contactData,
    streetAddress: address.street || '',
    postalCode: address.postalCode || '',
    city: address.city || '',
    country: {
      value: address.countryOrRegion ? address.countryOrRegion : country?.value,
      label: address.countryOrRegion ? address.countryOrRegion : country?.label,
    },
    mobilePhone: mobilePhone ? mobilePhone.number : '',
    businessPhones: businessPhones || '',
  }

  const formDisabled =
    queryError === true || !!ContactError || !Contact || Object.keys(contactData).length === 0
  const RawUser = JSON.stringify(contactData, null, 2)
  return (
    <CippPage
      title={`Edit Contact: ${ContactIsFetching ? 'Loading...' : contactData.displayName}`}
      tenantSelector={false}
    >
      {!queryError && (
        <>
          {postResults.isSuccess && (
            <CCallout color="success">{postResults.data?.Results}</CCallout>
          )}
          {queryError && (
            <CRow>
              <CCol xs={12}>
                <CCallout color="danger">
                  {/* @todo add more descriptive help message here */}
                  Failed to load contact
                </CCallout>
              </CCol>
            </CRow>
          )}
          <CRow className="mb-3">
            <CCol lg={6} xs={12}>
              <CippContentCard title="Contact Details" icon={faEdit}>
                {ContactIsFetching && <CSpinner />}
                {ContactError && <span>Error loading user</span>}
                {!ContactIsFetching && (
                  <Form
                    initialValues={{ ...initialState }}
                    onSubmit={onSubmit}
                    render={({ handleSubmit, submitting, values }) => {
                      return (
                        <CForm onSubmit={handleSubmit}>
                          <CRow>
                            <CCol lg={6} xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="givenName"
                                label="Edit First Name"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol lg={6} xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="surname"
                                label="Edit Last Name"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="displayName"
                                label="Edit Display Name"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="mail"
                                label="Edit email"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol xs={12}>
                              <RFFCFormInput
                                type="text"
                                name="jobTitle"
                                label="Edit Job Title"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="streetAddress"
                                label="Street"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="postalCode"
                                label="Postal Code"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="city"
                                label="City"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFSelectSearch
                                values={countryList.map(({ Code, Name }) => ({
                                  value: Code,
                                  name: Name,
                                }))}
                                name="country"
                                placeholder="Type to search..."
                                label="Country"
                                validate={required}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="companyName"
                                label="Company Name"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="mobilePhone"
                                label="Mobile #"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                            <CCol md={6}>
                              <RFFCFormInput
                                name="businessPhones"
                                label="Business #"
                                type="text"
                                disabled={formDisabled}
                              />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CCol md={6}>
                              <CButton type="submit" disabled={submitting || formDisabled}>
                                Edit Contact
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
                          </CRow>
                          {postResults.isSuccess && (
                            <CCallout color="success">
                              {Array.isArray(postResults.data.Results) ? (
                                postResults.data.Results.map((message, idx) => (
                                  <li key={idx}>{message}</li>
                                ))
                              ) : (
                                <span>{postResults.data.Results}</span>
                              )}
                            </CCallout>
                          )}
                        </CForm>
                      )
                    }}
                  />
                )}
              </CippContentCard>
            </CCol>
            <CCol lg={6} xs={12}>
              <CippContentCard title="Raw User Data" icon={faEye}>
                {ContactIsFetching && <CSpinner />}
                {ContactError && <span>Error loading user</span>}
                {!ContactIsFetching && (
                  <>
                    This is the (raw) information for this contact.
                    <CippCodeBlock language="json" code={RawUser} />
                  </>
                )}
              </CippContentCard>
            </CCol>
          </CRow>
        </>
      )}
    </CippPage>
  )
}

export default EditContact
