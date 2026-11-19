import { fireEvent, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import { CippAppPackageFields } from '../../../src/components/CippComponents/CippAppPackageFields'
import { CippMacAppPackageFields } from '../../../src/components/CippComponents/CippMacAppPackageFields'

// Replacing the package file: values the previous file filled in must follow the new file, values the
// user typed must stay.
vi.mock('../../../src/api/ApiCall', async (importOriginal) => ({
  ...(await importOriginal()),
  ApiPostCall: () => ({ mutateAsync: vi.fn() }),
}))

const msiProperties = {
  'contoso.msi': {
    ProductCode: '{11111111-2222-3333-4444-555555555555}',
    ProductVersion: '1.2.3',
    Manufacturer: 'Contoso',
    ALLUSERS: '1',
  },
}
vi.mock('../../../src/utils/intunewin-package', async (importOriginal) => ({
  ...(await importOriginal()),
  readMsiProperties: async (file) => msiProperties[file.name],
  packageInstaller: async ({ file }) => ({
    packageId: `id-${file.name}`,
    blockCount: 1,
    metadata: { SetupFile: file.name },
  }),
}))
vi.mock('../../../src/utils/macos-package', async (importOriginal) => ({
  ...(await importOriginal()),
  readMacPackage: async () => ({ kind: 'pkg', title: null, bundles: [] }),
  encryptAndUploadPackage: async ({ file }) => ({
    packageId: `id-${file.name}`,
    blockCount: 1,
    metadata: {},
  }),
}))

const renderFields = (Fields) => {
  let form
  const Harness = () => {
    form = useForm()
    return <Fields formControl={form} />
  }
  const { container } = renderWithProviders(<Harness />)
  const pick = async (name) => {
    fireEvent.change(container.querySelector('#file-input-packageFile'), {
      target: { files: [new File(['x'], name)] },
    })
    await waitFor(() =>
      expect(form.getValues('packageInfo')?.fileName).toBe(name)
    )
  }
  return { form: () => form, pick }
}

describe('CippAppPackageFields: replacing the installer', () => {
  it('renames the application after the new installer', async () => {
    const { form, pick } = renderFields(CippAppPackageFields)

    await pick('first-setup.exe')
    await pick('second-setup.exe')

    expect(form().getValues('applicationName')).toBe('second-setup')
    expect(form().getValues('installCommandLine')).toBe('"second-setup.exe"')
  })

  it('keeps a name the user typed', async () => {
    const { form, pick } = renderFields(CippAppPackageFields)

    await pick('first-setup.exe')
    form().setValue('applicationName', 'Contoso Agent')
    await pick('second-setup.exe')

    expect(form().getValues('applicationName')).toBe('Contoso Agent')
  })

  it('drops the MSI details when an .msi is replaced by an .exe', async () => {
    const { form, pick } = renderFields(CippAppPackageFields)

    await pick('contoso.msi')
    expect(form().getValues('publisher')).toBe('Contoso')
    expect(form().getValues('detectionType')).toBe('msi')
    await pick('other-setup.exe')

    expect(form().getValues()).toMatchObject({
      applicationName: 'other-setup',
      publisher: '',
      displayVersion: '',
      uninstallCommandLine: '',
      installCommandLine: '"other-setup.exe"',
      detectionType: 'file',
    })
    expect(form().getValues('msiProductCode')).toBeFalsy()
  })
})

describe('CippMacAppPackageFields: replacing the package', () => {
  it('renames the application after the new package, unless the user typed one', async () => {
    const { form, pick } = renderFields(CippMacAppPackageFields)

    await pick('First.pkg')
    await pick('Second.pkg')
    expect(form().getValues('applicationName')).toBe('Second')

    form().setValue('applicationName', 'Contoso for Mac')
    await pick('Third.pkg')
    expect(form().getValues('applicationName')).toBe('Contoso for Mac')
  })
})
