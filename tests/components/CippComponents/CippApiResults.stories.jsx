import { CippApiResults } from '../../../src/components/CippComponents/CippApiResults'

export default {
  title: 'Components/CippComponents/CippApiResults',
  component: CippApiResults,
  tags: ['autodocs'],
  argTypes: {
    errorsOnly: { control: 'boolean' },
  },
}

export const Success = {
  args: {
    apiObject: {
      data: { Results: 'User created successfully' },
      isFetching: false,
      isSuccess: true,
      isError: false,
    },
  },
}

export const Error = {
  args: {
    apiObject: {
      data: { Results: 'Error: User not found' },
      isFetching: false,
      isSuccess: true,
      isError: false,
    },
  },
}

export const Loading = {
  args: {
    apiObject: {
      data: undefined,
      isFetching: true,
      isSuccess: false,
      isError: false,
    },
  },
}

export const ArrayResults = {
  args: {
    apiObject: {
      data: {
        Results: ['User created', 'License assigned', 'Error: MFA setup failed'],
      },
      isFetching: false,
      isSuccess: true,
      isError: false,
    },
  },
}

export const ErrorsOnly = {
  args: {
    errorsOnly: true,
    apiObject: {
      data: {
        Results: ['User created successfully', 'Error: License assignment failed', 'Group membership updated', 'Error: MFA policy could not be applied'],
      },
      isFetching: false,
      isSuccess: true,
      isError: false,
    },
  },
}
