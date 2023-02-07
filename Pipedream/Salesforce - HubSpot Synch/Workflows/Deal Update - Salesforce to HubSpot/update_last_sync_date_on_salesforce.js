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
      last_sync_date__c: steps.trigger.event.New.LastModifiedDate,
    };

    if (steps.check_deal_on_hubspot.$return_value[0] === "End") {
      console.log("Exiting update of last sync date to salesforce...");
    } else {
      var response = await axios($, {
        method: "patch",
        url:
          `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/Opportunity/` +
          steps.trigger.event.New.Id,
        headers: {
          Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
          "Content-Type": "application/json",
        },
        data: composite_json,
      });
      console.log(
        "Updating opportunity last sync date on Salesforce ",
        response
      );
      return response;
    }
  },
});
