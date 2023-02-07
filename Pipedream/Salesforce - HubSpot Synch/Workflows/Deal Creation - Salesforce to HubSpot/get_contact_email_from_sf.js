import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    var tmp_sf_id = steps.trigger.event.New.ContactId;
    return await axios($, {
      url: `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/Contact/${tmp_sf_id}`,
      headers: {
        Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
      },
    });
  },
});
