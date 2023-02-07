import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    const composite_json = {
      Hubspot_ID__c: steps.create_contact_on_hubspot.$return_value,
      last_sync_date__c: steps.trigger.event.New.LastModifiedDate,
      sync_status__c: false,
    };

    var response = await axios($, {
      method: "patch",
      url:
        `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/Contact/` +
        steps.trigger.event.New.Id,
      headers: {
        Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
        "Content-Type": "application/json",
      },
      data: composite_json,
    });
    console.log("Update salesforce with hubspot id response is ", response);
    return response;
  },
});
