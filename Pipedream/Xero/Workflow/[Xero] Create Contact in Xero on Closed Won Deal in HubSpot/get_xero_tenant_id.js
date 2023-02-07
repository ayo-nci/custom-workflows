import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    xero_accounting_api: {
      type: "app",
      app: "xero_accounting_api",
    },
  },
  async run({ steps, $ }) {
    return await axios($, {
      url: `https://api.xero.com/connections`,
      headers: {
        Authorization: `Bearer ${this.xero_accounting_api.$auth.oauth_access_token}`,
      },
    });
  },
});
