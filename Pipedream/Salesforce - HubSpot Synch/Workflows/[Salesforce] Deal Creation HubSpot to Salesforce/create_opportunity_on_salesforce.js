import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    let closedate_tmp = new Date(Number(steps.trigger.event.body.closedate))
      .toLocaleDateString("en-UK")
      .split("/")
      .reverse()
      .join("-");

    const composite_json = {
      Name: steps.trigger.event.body.deal_name,
      OwnerId: "0057Q000005EyxPQAS", //Should this be static?
      Probability: steps.trigger.event.body.hs_deal_stage_probability
        ? Number(steps.trigger.event.body.hs_deal_stage_probability) * 100.0
        : 10.0,
      StageName: "Prospecting",
      Type: null,
      Description: null,
      Amount: null,
      sync_status__c: false,
      CloseDate: closedate_tmp, //"2022-07-22",
    };

    if (steps.trigger.event.body.sync_status !== "false") {
      var response = await axios($, {
        method: "patch",
        url:
          `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/opportunity/Hubspot_Deal_ID__c/` +
          steps.trigger.event.body.deal_ID,
        headers: {
          Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
          "Content-Type": "application/json",
        },
        data: composite_json,
      });

      console.log("resp is", response);

      //Get salesforce_id for created contact and update contact on hubspot for a create job

      return response.id;
    } else {
      console.log("Sync status is " + steps.trigger.event.body.sync_status);
      console.log("Stopping 2 way loop");
    }
  },
});
