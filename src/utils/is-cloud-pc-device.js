// Windows 365 Cloud PCs never report BitLocker (isEncrypted stays false) although their disks
// are platform-encrypted by Azure, so encryption reporting must not flag them as unencrypted.
// Mirrors the backend Test-CIPPCloudPCDevice check: the cached CIPP marker, the documented
// deviceType signal (chassisType kept in case the service starts emitting it), then the
// model/manufacturer pair Windows 365 provisions.
export const isCloudPcDevice = (device) =>
  device?.isCloudPC === true ||
  device?.deviceType === 'cloudPC' ||
  device?.chassisType === 'cloudPC' ||
  (typeof device?.model === 'string' &&
    device.model.toLowerCase().startsWith('cloud pc') &&
    typeof device?.manufacturer === 'string' &&
    device.manufacturer.toLowerCase() === 'microsoft corporation')
