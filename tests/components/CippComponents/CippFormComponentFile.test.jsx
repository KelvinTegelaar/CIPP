import { fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import CippFormComponent from '../../../src/components/CippComponents/CippFormComponent'

// The file branch passed onChange to the native input as well, so a handler ran twice for one
// selection: first with the change event, then with the file.
const Harness = ({ onChange }) => {
  const formControl = useForm()
  return (
    <CippFormComponent
      type="file"
      name="upload"
      label="Upload"
      formControl={formControl}
      onChange={onChange}
    />
  )
}

describe('CippFormComponent — file', () => {
  it('calls onChange once, with the selected file', () => {
    const onChange = vi.fn()
    const { container } = renderWithProviders(<Harness onChange={onChange} />)
    const file = new File(['x'], 'setup.msi')

    fireEvent.change(container.querySelector('#file-input-upload'), {
      target: { files: [file] },
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(file)
  })
})
