import PropTypes from 'prop-types'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'

/**
 * Shared version-cleanup mode fields for Storage Report cleanup and site capacity dialog.
 */
export const CippSharePointVersionCleanupFields = ({ formHook }) => (
  <>
    <CippFormComponent
      type="radio"
      name="BatchDeleteMode"
      label="Cleanup Mode"
      formControl={formHook}
      options={[
        { label: 'Sync Policy — apply site version policy to existing versions', value: '2' },
        {
          label: 'Delete Older Than Days — remove versions older than a set number of days',
          value: '0',
        },
        { label: 'Count Limits — keep a maximum number of major versions', value: '1' },
      ]}
    />
    <CippFormCondition
      field="BatchDeleteMode"
      compareType="is"
      compareValue="0"
      formControl={formHook}
    >
      <CippFormComponent
        type="number"
        name="DeleteOlderThanDays"
        label="Delete Versions Older Than (days)"
        formControl={formHook}
        validators={{
          required: 'Please enter the number of days',
          min: { value: 30, message: 'SharePoint requires at least 30 days' },
        }}
      />
    </CippFormCondition>
    <CippFormCondition
      field="BatchDeleteMode"
      compareType="is"
      compareValue="1"
      formControl={formHook}
    >
      <CippFormComponent
        type="number"
        name="MajorVersionLimit"
        label="Maximum Major Versions to Keep"
        formControl={formHook}
        validators={{ required: 'Please enter the version limit' }}
      />
      <CippFormComponent
        type="number"
        name="MajorWithMinorVersionsLimit"
        label="Major Versions That Keep Their Minor Versions"
        formControl={formHook}
        validators={{ required: 'Please enter the major-with-minor version limit' }}
      />
    </CippFormCondition>
  </>
)

CippSharePointVersionCleanupFields.propTypes = {
  formHook: PropTypes.object.isRequired,
}

export default CippSharePointVersionCleanupFields
