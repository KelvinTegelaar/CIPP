import { CButton } from '@coreui/react'
import { faBan, faBook, faCheck, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { cellBooleanFormatter, cellDateFormatter, CellTip } from 'src/components/tables'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  //console.log(row)
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="User Information"
        extendedInfo={[
          {
            label: 'Increase spam score with image links',
            value: `${row.IncreaseScoreWithImageLinks}`,
          },
          {
            label: 'Increase spam score with links that contain an ip',
            value: `${row.IncreaseScoreWithNumericIps}`,
          },
          {
            label: 'Increase Spam score with links that contain ports',
            value: `${row.IncreaseScoreWithRedirectToOtherPort}`,
          },
          {
            label: 'Increase Spam score for .Biz or .Info',
            value: `${row.IncreaseScoreWithBizOrInfoUrls}`,
          },
          { label: 'Mark Empty Messages as spam', value: `${row.MarkAsSpamEmptyMessages}` },
          {
            label: 'Mark javascript in HTML as spam',
            value: `${row.MarkAsSpamJavaScriptInHtml}`,
          },
          { label: 'Mark iFrames as spam', value: `${row.MarkAsSpamFramesInHtml}` },
          { label: 'Mark Object tags as spam', value: `${row.MarkAsSpamObjectTagsInHtml}` },
          { label: 'Mark Embedded HTML as spam', value: `${row.MarkAsSpamEmbedTagsInHtml}` },
          { label: 'Mark Form tags as spam', value: `${row.MarkAsSpamFormTagsInHtml}` },
          { label: 'Mark known html bugs as spam', value: `${row.MarkAsSpamWebBugsInHtml}` },
          {
            label: 'Mark Senstive wordlists as spam.',
            value: `${row.MarkAsSpamSensitiveWordList}`,
          },
          { label: 'Mark SPF Hard Fail as spam', value: `${row.MarkAsSpamSpfRecordHardFail}` },
          { label: 'Mark SenderID Fails as spam', value: `${row.MarkAsSpamFromAddressAuthFail}` },
          { label: 'Mark known bulk mail as spam', value: `${row.MarkAsSpamBulkMail}` },
          { label: 'Mark Backscatter as spam', value: `${row.MarkAsSpamNdrBackscatter}` },
        ]}
        actions={[
          {
            label: 'Create template based on rule',
            color: 'info',
            modal: true,
            icon: <FontAwesomeIcon icon={faBook} className="me-2" />,
            modalBody: row,
            modalType: 'POST',
            modalUrl: `/api/AddSpamfilterTemplate`,
            modalMessage: 'Are you sure you want to create a template based on this rule?',
          },
          {
            label: 'Enable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditSpamfilter?State=enable&TenantFilter=${tenant.defaultDomainName}&name=${row.Name}`,
            modalMessage: 'Are you sure you want to enable this rule?',
          },
          {
            label: 'Disable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditSpamfilter?State=disable&TenantFilter=${tenant.defaultDomainName}&name=${row.Name}`,
            modalMessage: 'Are you sure you want to disable this rule?',
          },
          {
            label: 'Delete Rule',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
            modalUrl: `/api/RemoveSpamFilter?TenantFilter=${tenant.defaultDomainName}&name=${row.Name}`,
            modalMessage: 'Are you sure you want to delete this rule?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const columns = [
  {
    name: 'Name',
    selector: (row) => row['Name'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['Name']),
    exportSelector: 'Name',
  },
  {
    name: 'Default Rule',
    selector: (row) => row['IsDefault'],
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'IsDefault',
  },
  {
    name: 'Rule State',
    selector: (row) => row['ruleState'],
    sortable: true,
    exportSelector: 'ruleState',
  },
  {
    name: 'Priority',
    selector: (row) => row['rulePrio'],
    sortable: true,
    exportSelector: 'rulePrio',
  },
  {
    name: 'High Confidence Spam Action',
    selector: (row) => row['HighConfidenceSpamAction'],
    sortable: true,
    exportSelector: 'HighConfidenceSpamAction',
  },
  {
    name: 'Bulk Spam Action',
    selector: (row) => row['BulkSpamAction'],
    sortable: true,
    exportSelector: 'BulkSpamAction',
  },
  {
    name: 'Phish Spam Action',
    selector: (row) => row['PhishSpamAction'],
    sortable: true,
    exportSelector: 'PhishSpamAction',
  },
  {
    name: 'Creation Date',
    selector: (row) => row['WhenCreated'],
    sortable: true,
    exportSelector: 'WhenChanged',
    cell: cellDateFormatter(),
  },
  {
    name: 'Last Edit Date',
    selector: (row) => row['WhenChanged'],
    sortable: true,
    exportSelector: 'WhenChanged',
    cell: cellDateFormatter(),
  },
  {
    name: 'Actions',
    cell: Offcanvas,
    maxWidth: '80px',
  },
]

const SpamFilterList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Spam Filters"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-Spamfilter-list`,
        path: '/api/Listspamfilter',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default SpamFilterList
