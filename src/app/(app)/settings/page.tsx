import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Settings" };

type Tab = "general" | "notifications" | "team" | "api" | "appearance";

interface SettingsData {
  general: Record<string, unknown>;
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    types: Record<string, boolean>;
  };
}

async function getSettings(organizationId: string): Promise<SettingsData> {
  const settings = await prisma.systemSetting.findMany({
    where: { organizationId },
  });

  const general: Record<string, unknown> = {};
  for (const s of settings) {
    general[s.key] = s.value;
  }

  return {
    general,
    notifications: {
      emailEnabled: (general.notificationEmailEnabled as boolean) ?? true,
      pushEnabled: (general.notificationPushEnabled as boolean) ?? true,
      inAppEnabled: (general.notificationInAppEnabled as boolean) ?? true,
      types: (general.notificationTypes as Record<string, boolean>) ?? {},
    },
  };
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "settings_read")) return null;

  const settings = await getSettings(user.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage organization preferences and integrations</p>
        </div>
      </div>

      <nav className="flex gap-1 bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Settings sections">
        {[
          { id: "general", label: "General", icon: "🏢" },
          { id: "notifications", label: "Notifications", icon: "🔔" },
          { id: "team", label: "Team", icon: "👥" },
          { id: "api", label: "API Keys", icon: "🔑" },
          { id: "appearance", label: "Appearance", icon: "🎨" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected="false"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-white transition-colors"
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <GeneralSettings data={settings.general} organizationId={user.organizationId} />
      </div>
    </div>
  );
}

function GeneralSettings({ data, organizationId }: { data: Record<string, unknown>; organizationId: string }) {
  return (
    <form className="space-y-6" action={`/api/settings/general`} method="POST">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              defaultValue={(data.companyName as string) ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="slogan" className="block text-sm font-medium text-gray-700 mb-1">
              Slogan
            </label>
            <input
              id="slogan"
              name="slogan"
              defaultValue={(data.slogan as string) ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Support Email
            </label>
            <input
              id="supportEmail"
              name="supportEmail"
              type="email"
              defaultValue={(data.supportEmail as string) ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={(data.timezone as string) ?? "Asia/Shanghai"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-1">
              Default Language
            </label>
            <select
              id="defaultLanguage"
              name="defaultLanguage"
              defaultValue={(data.defaultLanguage as string) ?? "en"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português (Brasil)</option>
              <option value="es">Español</option>
              <option value="zh-CN">中文 (简体)</option>
            </select>
          </div>
          <div>
            <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-1">
              Default Currency
            </label>
            <select
              id="defaultCurrency"
              name="defaultCurrency"
              defaultValue={(data.defaultCurrency as string) ?? "USD"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="BRL">BRL (R$)</option>
              <option value="EUR">EUR (€)</option>
              <option value="CNY">CNY (¥)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment Numbering</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="shipmentNumberFormat" className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <input
              id="shipmentNumberFormat"
              name="shipmentNumberFormat"
              defaultValue={(data.shipmentNumberFormat as string) ?? "SHP-{YYYY}-{000000}"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Tokens: {'{YYYY}'}, {'{MM}'}, {'{DD}'}, {'{counter}'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </form>
  );
}