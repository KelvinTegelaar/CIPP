export const parseMailboxAuditData = (mailboxData) => {
  if (!mailboxData?.Mailbox) {
    return null;
  }

  const mailbox = Array.isArray(mailboxData.Mailbox) 
    ? mailboxData.Mailbox[0] 
    : mailboxData.Mailbox;
  const orgConfig = mailboxData.OrganizationConfig || {};
  const bypassEnabled = mailboxData.AuditBypassEnabled || false;

  // Strict supported actions for each access type (must match backend and Exchange real-world behavior)
  const AllActions = {
    Owner: [
      'ApplyRecord',
      'AttachmentAccess',
      'Create',
      'HardDelete',
      'MailboxLogin',
      'MailItemsAccessed',
      'Move',
      'MoveToDeletedItems',
      'RecordDelete',
      'SearchQueryInitiated',
      'Send',
      'SoftDelete',
      'Update',
      'UpdateCalendarDelegation',
      'UpdateFolderPermissions',
      'UpdateInboxRules',
    ],
    Delegate: [
      'ApplyRecord',
      'AttachmentAccess',
      'Create',
      'FolderBind',
      'HardDelete',
      'MailItemsAccessed',
      'Move',
      'MoveToDeletedItems',
      'RecordDelete',
      'SendAs',
      'SendOnBehalf',
      'SoftDelete',
      'Update',
      'UpdateFolderPermissions',
      'UpdateInboxRules',
    ],
    Admin: [
      'ApplyRecord',
      'AttachmentAccess',
      'Copy',
      'Create',
      'FolderBind',
      'HardDelete',
      'MailItemsAccessed',
      'Move',
      'MoveToDeletedItems',
      'RecordDelete',
      'Send',
      'SendAs',
      'SendOnBehalf',
      'SoftDelete',
      'Update',
      'UpdateCalendarDelegation',
      'UpdateFolderPermissions',
      'UpdateInboxRules',
    ],
  };

  // Get enabled actions (handle both array and comma-separated string formats)
  const getEnabledActions = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((s) => s.trim());
    return [];
  };

  const enabledOwner = getEnabledActions(mailbox.AuditOwner);
  const enabledDelegate = getEnabledActions(mailbox.AuditDelegate);
  const enabledAdmin = getEnabledActions(mailbox.AuditAdmin);

  // Get all unique action names
  const allActionNames = [
    ...new Set([...AllActions.Owner, ...AllActions.Delegate, ...AllActions.Admin]),
  ].sort();

  // Build comparison data for each action
  const auditActions = allActionNames.map((action) => ({
    Action: action,
    OwnerSupported: AllActions.Owner.includes(action),
    OwnerEnabled: enabledOwner.includes(action),
    DelegateSupported: AllActions.Delegate.includes(action),
    DelegateEnabled: enabledDelegate.includes(action),
    AdminSupported: AllActions.Admin.includes(action),
    AdminEnabled: enabledAdmin.includes(action),
  }));

  return {
    AuditEnabled: mailbox.AuditEnabled || false,
    AuditBypassEnabled: bypassEnabled,
    AuditLogAgeLimit: mailbox.AuditLogAgeLimit || '90',
    DefaultActions: mailbox.DefaultAuditSet?.join?.(', ') || '',
    AuditActions: auditActions,
    AuditOwner: enabledOwner,
    AuditDelegate: enabledDelegate,
    AuditAdmin: enabledAdmin,
    RecipientTypeDetails: mailbox.RecipientTypeDetails,
    OrgAuditDisabled: orgConfig.AuditDisabled || false,
    OrgAuditLogAgeLimit: orgConfig.AuditLogAgeLimit || null,
  };
};