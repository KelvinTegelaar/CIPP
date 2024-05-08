import React, { useState } from 'react'
import { useGenericGetRequestQuery, useLazyGenericGetRequestQuery } from 'src/store/api/app.js'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import CippChartCard from 'src/components/contentcards/CippChartCard'
import { CippDatatable, CippTable, cellDateFormatter } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { CippCallout, CippContentCard } from 'src/components/layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import { ModalService } from 'src/components/utilities'

/**
 * Performs maintenance operations on settings.
 *
 * @returns {JSX.Element} The JSX element representing the settings maintenance component.
 */
export function SettingsMaintenance() {
  const orchestrators = useGenericGetRequestQuery({
    path: '/api/ExecDurableFunctions',
    params: { Action: 'ListOrchestrators' },
  })
  const durableStats = useGenericGetRequestQuery({
    path: '/api/ExecDurableFunctions',
    params: { Action: 'ListStats' },
  })

  const [resetDurables, resetDurableStatus] = useLazyGenericGetRequestQuery()

  const handleResetDurables = (action) => {
    var actionText = ''
    if (action === 'ResetDurables') {
      actionText = 'clear Durable Queues? This will stop all queued functions from executing.'
    } else if (action === 'PurgeOrchestrators') {
      actionText =
        'purge Orchestrator Instances and History? This will also remove the largemessages blob container.'
    }
    ModalService.confirm({
      title: 'Danger Zone',
      body: <div>Are you sure you want to {actionText}</div>,
      onConfirm: () =>
        resetDurables({
          path: '/api/ExecDurableFunctions',
          params: { Action: action },
        }).then(() => {
          orchestrators.refetch()
          durableStats.refetch()
        }),
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
    })
  }

  const ResetButton = (
    <>
      <CButton
        size="sm"
        onClick={() => handleResetDurables('ResetDurables')}
        color="danger"
        className="me-2"
      >
        <FontAwesomeIcon icon="eraser" /> Clear Durable Queues
      </CButton>
      <CButton
        size="sm"
        onClick={() => handleResetDurables('PurgeOrchestrators')}
        color="danger"
        className="me-2"
      >
        <FontAwesomeIcon icon="trash" /> Purge Orchestrators
      </CButton>
    </>
  )

  return (
    <div className="mh-100">
      <CRow className="mb-3">
        <CCol sm={12} md={5} className="mh-25">
          <CippChartCard
            title="Durable Queues"
            titleType="big"
            ChartType="bar"
            ChartLabels={durableStats.data?.Queues?.map((queue) => {
              return queue?.Name
            })}
            ChartData={durableStats.data?.Queues?.map((queue) => {
              return queue?.ApproximateMessageCount
            })}
            isFetching={durableStats.isFetching}
            refreshFunction={() => durableStats.refetch()}
          />
        </CCol>
        <CCol sm={12} md={3} className="mh-25">
          <CippChartCard
            title="Status"
            titleType="big"
            ChartType="pie"
            ChartLabels={durableStats.data?.Orchestrators?.map((status) => {
              return status.Name
            })}
            ChartData={durableStats?.data?.Orchestrators?.map((status) => {
              return status.Count
            })}
            isFetching={durableStats.isFetching}
            refreshFunction={() => durableStats.refetch()}
          />
        </CCol>
        <CCol sm={12} md={4}>
          <CippButtonCard title="Troubleshooting" titleType="big" CardButton={ResetButton}>
            <small>
              <p>Use these actions when troubleshooting performance issues with the backend.</p>
              <p>
                <b>NOTE: Resetting durables will terminate any running processes.</b>
              </p>
            </small>

            {resetDurableStatus.isFetching && <CSpinner className="ms-2" />}
            {!resetDurableStatus.isFetching && resetDurableStatus.isSuccess && (
              <CippCallout color="info" dismissible>
                {resetDurableStatus?.data?.Message}
              </CippCallout>
            )}
          </CippButtonCard>
        </CCol>
      </CRow>
      <CRow className="mb-3">
        <CCol className="mh-75">
          <CippContentCard title="Orchestrators" titleType="big">
            <CippTable
              data={orchestrators?.data?.Orchestrators}
              columns={[
                {
                  name: 'Created',
                  selector: (row) => row['CreatedTime'],
                  sortable: true,
                  cell: cellDateFormatter({ format: 'short' }),
                },
                {
                  name: 'Completed',
                  selector: (row) => row?.CompletedTime,
                  sortable: true,
                  cell: cellDateFormatter({ format: 'short' }),
                },
                {
                  name: 'Name',
                  selector: (row) => row['Name'],
                  sortable: true,
                  cell: cellGenericFormatter(),
                },
                {
                  name: 'Status',
                  selector: (row) => row['RuntimeStatus'],
                  sortable: true,
                  cell: cellGenericFormatter(),
                },
                {
                  name: 'Input',
                  selector: (row) => row['Input'],
                  cell: cellGenericFormatter(),
                },
              ]}
              filterlist={[
                { filterName: 'Running', filter: 'Complex: RuntimeStatus eq Running' },
                { filterName: 'Pending', filter: 'Complex: RuntimeStatus eq Pending' },
                { filterName: 'Completed', filter: 'Complex: RuntimeStatus eq Completed' },
                { filterName: 'Failed', filter: 'Complex: RuntimeStatus eq Failed' },
              ]}
              isFetching={orchestrators.isFetching}
              refreshFunction={() => orchestrators.refetch()}
            />
          </CippContentCard>
        </CCol>
      </CRow>
    </div>
  )
}
