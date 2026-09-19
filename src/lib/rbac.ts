export const PERMISSIONS = {
  shipment_read: "shipments.read",
  shipment_create: "shipments.create",
  shipment_update: "shipments.update",
  shipment_cancel: "shipments.cancel",
  shipment_label: "shipments.label",
  shipment_receive: "shipments.receive",
  customer_read: "customers.read",
  customer_create: "customers.create",
  customer_update: "customers.update",
  carrier_read: "carriers.read",
  carrier_manage: "carriers.manage",
  carrier_connect: "carriers.connect",
  settings_read: "settings.read",
  settings_manage: "settings.manage",
  users_manage: "users.manage",
  audit_read: "audit.read",
  reports_read: "reports.read",
  notifications_read: "notifications.read",
  api_manage: "api.manage",
  exceptions_manage: "exceptions.manage",
  support_manage: "support.manage",
  warehouse_manage: "warehouse.manage",
  organization_manage: "organizations.manage",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

type RolePermissionMap = Record<string, PermissionKey[]>;

export const ROLE_PERMISSIONS: RolePermissionMap = {
  SUPER_ADMIN: [
    "shipment_read",
    "shipment_create",
    "shipment_update",
    "shipment_cancel",
    "shipment_label",
    "shipment_receive",
    "customer_read",
    "customer_create",
    "customer_update",
    "carrier_read",
    "carrier_manage",
    "carrier_connect",
    "settings_read",
    "settings_manage",
    "users_manage",
    "audit_read",
    "reports_read",
    "notifications_read",
    "api_manage",
    "exceptions_manage",
    "support_manage",
    "warehouse_manage",
    "organization_manage",
  ],
  ADMIN: [
    "shipment_read",
    "shipment_create",
    "shipment_update",
    "shipment_cancel",
    "shipment_label",
    "shipment_receive",
    "customer_read",
    "customer_create",
    "customer_update",
    "carrier_read",
    "carrier_manage",
    "carrier_connect",
    "settings_read",
    "settings_manage",
    "audit_read",
    "reports_read",
    "notifications_read",
    "api_manage",
    "exceptions_manage",
    "support_manage",
    "warehouse_manage",
  ],
  OPERATOR: [
    "shipment_read",
    "shipment_create",
    "shipment_update",
    "shipment_cancel",
    "shipment_label",
    "shipment_receive",
    "customer_read",
    "customer_create",
    "customer_update",
    "carrier_read",
    "notifications_read",
    "exceptions_manage",
    "warehouse_manage",
  ],
  CUSTOMER: [
    "shipment_read",
    "shipment_create",
    "customer_read",
    "customer_update",
    "notifications_read",
  ],
};

export function permissionsForRole(roleCode: string): PermissionKey[] {
  return ROLE_PERMISSIONS[roleCode] ?? [];
}

export function roleHasPermission(roleCode: string, permission: PermissionKey): boolean {
  return permissionsForRole(roleCode).includes(permission);
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  OPERATOR: "Operator",
  CUSTOMER: "Customer",
};