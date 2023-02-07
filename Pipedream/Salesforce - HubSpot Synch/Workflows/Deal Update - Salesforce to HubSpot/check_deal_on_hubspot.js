// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // get by unique identifier
    //Function verify email
    const check_deal_in_hubspot = async (the_deal_id) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = "DEAL";
      const unique_identifier = "unique_id";
      const deal_id = the_deal_id;
      const req_url =
        hub_url +
        object_type +
        "/" +
        deal_id +
        "?idProperty=" +
        unique_identifier +
        "&hapikey=" +
        "13";
      console.log(req_url);
      try {
        const check_email_resp = await axios({
          method: "GET",
          url: req_url,
        });

        if (check_email_resp.data.hasOwnProperty("id")) {
          return [
            check_email_resp.data.id,
            check_email_resp.data.properties.lastmodifieddate,
          ];
        }
      } catch (error) {
        console.log("Error is", error.response.data);
        if (error.response.status == 404) {
          return ["Not found"];
        }
      }
    };
    if (steps.trigger.event.New.sync_status__c !== false) {
      console.log(
        "Checking hubspot for deal",
        steps.trigger.event.Old.Hubspot_Deal_ID__c
      );
      var dealID = await check_deal_in_hubspot(
        steps.trigger.event.Old.Hubspot_Deal_ID__c
      );

      console.log("Deal id is ", dealID[0]);

      return dealID;
    } else {
      console.log("Stopping 2 way loop");
      return ["End"];
    }
  },
});
