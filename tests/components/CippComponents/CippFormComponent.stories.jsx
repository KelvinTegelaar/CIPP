import { CippFormComponent } from '../../../src/components/CippComponents/CippFormComponent'
import { FormDecorator } from '../../utils/form-decorator'

const departmentOptions = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Sales', value: 'sales' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Human Resources', value: 'hr' },
  { label: 'Finance', value: 'finance' },
  { label: 'Legal', value: 'legal' },
  { label: 'IT', value: 'it' },
  { label: 'Operations', value: 'operations' },
]

const licenseOptions = [
  { label: 'Microsoft 365 E3', value: 'M365_E3' },
  { label: 'Microsoft 365 E5', value: 'M365_E5' },
  { label: 'Microsoft 365 Business Basic', value: 'M365_BB' },
  { label: 'Microsoft 365 Business Premium', value: 'M365_BP' },
  { label: 'Exchange Online Plan 1', value: 'EXO_P1' },
  { label: 'Exchange Online Plan 2', value: 'EXO_P2' },
]

const statusOptions = [
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Report Only', value: 'reportOnly' },
]

export default {
  title: 'Components/CippComponents/CippFormComponent',
  component: CippFormComponent,
  tags: ['autodocs'],
  decorators: [FormDecorator],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [
        'textField',
        'textFieldWithVariables',
        'password',
        'number',
        'switch',
        'checkbox',
        'radio',
        'select',
        'autoComplete',
        'richText',
        'CSVReader',
        'datePicker',
        'file',
        'hidden',
        'heading',
        'cippDataTable',
      ],
    },
  },
}

export const TextField = {
  args: {
    type: 'textField',
    name: 'displayName',
    label: 'Display Name',
  },
}

export const Password = {
  args: {
    type: 'password',
    name: 'password',
    label: 'Password',
  },
}

export const Number = {
  args: {
    type: 'number',
    name: 'age',
    label: 'Age',
  },
}

export const Switch = {
  args: {
    type: 'switch',
    name: 'enabled',
    label: 'Account Enabled',
  },
}

export const SwitchLabelAbove = {
  args: {
    type: 'switch',
    name: 'mfa',
    label: 'MFA Enabled',
    labelLocation: 'above',
  },
}

export const Checkbox = {
  args: {
    type: 'checkbox',
    name: 'agree',
    label: 'I agree to the terms',
  },
}

export const Radio = {
  args: {
    type: 'radio',
    name: 'status',
    label: 'Status',
    row: true,
    options: statusOptions,
  },
}

export const Select = {
  args: {
    type: 'select',
    name: 'department',
    label: 'Department',
    options: departmentOptions,
  },
}

export const AutoComplete = {
  args: {
    type: 'autoComplete',
    name: 'licenses',
    label: 'Assigned Licenses',
    multiple: true,
    options: licenseOptions,
  },
}

export const DatePicker = {
  args: {
    type: 'datePicker',
    name: 'startDate',
    label: 'Start Date',
  },
}

export const Heading = {
  args: {
    type: 'heading',
    label: 'User Configuration',
  },
}

export const Hidden = {
  args: {
    type: 'hidden',
    name: 'tenantId',
  },
}

export const RichText = {
  args: {
    type: 'richText',
    name: 'autoReply',
    label: 'Auto-Reply Message',
  },
}

export const WithHelperText = {
  args: {
    type: 'textField',
    name: 'email',
    label: 'Email',
    helperText: 'Enter the user principal name',
  },
}

export const WithValidation = {
  args: {
    type: 'textField',
    name: 'required',
    label: 'Required Field',
    validators: {
      required: { value: true, message: 'This field is required' },
    },
  },
}
