import React from 'react'
import { CippFormCondition } from '../../../src/components/CippComponents/CippFormCondition'
import { FormDecorator } from '../../utils/form-decorator'

export default {
  title: 'Components/CippComponents/CippFormCondition',
  component: CippFormCondition,
  tags: ['autodocs'],
  decorators: [FormDecorator],
  // formControl holds live dom refs, dynamic jsx source serialization stack-overflows on them
  parameters: { docs: { source: { type: 'code' } } },
  argTypes: {
    compareType: {
      control: { type: 'select' },
      options: [
        'is',
        'isNot',
        'contains',
        'doesNotContain',
        'greaterThan',
        'lessThan',
        'hasValue',
        'regex',
        'arrayLength',
        'labelEq',
        'labelContains',
        'valueEq',
        'valueNotEq',
        'valueContains',
        'isOneOf',
        'isNotOneOf',
      ],
    },
    action: {
      control: { type: 'select' },
      options: ['hide', 'disable'],
    },
  },
}

export const ConditionMet = {
  args: {
    defaultValues: { status: 'active' },
    field: 'status',
    compareType: 'is',
    compareValue: 'active',
    children: <p>This content is visible because status is active</p>,
  },
}

export const ConditionNotMet = {
  args: {
    defaultValues: { status: 'inactive' },
    field: 'status',
    compareType: 'is',
    compareValue: 'active',
    children: <p>This content is visible because status is active</p>,
  },
}

export const DisableAction = {
  args: {
    defaultValues: { toggle: false },
    field: 'toggle',
    compareType: 'is',
    compareValue: true,
    action: 'disable',
    children: <button>Submit</button>,
  },
}

export const HasValue = {
  args: {
    defaultValues: { name: 'John' },
    field: 'name',
    compareType: 'hasValue',
    children: <p>Name has a value</p>,
  },
}

export const Disabled = {
  args: {
    defaultValues: {},
    field: 'anything',
    compareType: 'is',
    compareValue: 'anything',
    disabled: true,
    children: <button>Always Disabled</button>,
  },
}
