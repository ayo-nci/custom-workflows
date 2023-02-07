import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    xero_accounting_api: {
      type: "app",
      app: "xero_accounting_api",
    },
  },
  async run({ steps, $ }) {
    let inv_url =
      "https://api.xero.com/api.xro/2.0/Invoices/" +
      steps.trigger.event.resourceId;

    return await axios($, {
      url: inv_url,
      headers: {
        Authorization: `Bearer ${this.xero_accounting_api.$auth.oauth_access_token}`,
        Accept: "application/json",
        "Xero-tenant-id": steps.get_tenant_id.$return_value[0].tenantId,
      },
    });
  },
});
