import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    //Function to update salesforce with either line item ID from hubspot or set pd_synch field to true
    const update_sf = async (sf_lineitem_id, the_json) => {
      var response = await axios($, {
        method: "patch",
        url:
          `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/opportunitylineitem/` +
          sf_lineitem_id,
        headers: {
          Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
          "Content-Type": "application/json",
        },
        data: the_json,
      });
      console.log("resp is", response);
    };

    let create_line_item_status =
      steps.create_line_items_on_hubspot.$return_value
        .salesforce_hubspot_line_item_id;

    if (create_line_item_status != undefined) {
      let sf_deal_id = steps.trigger.event.body.New.Id;
      let hs_line_item_id =
        steps.create_line_items_on_hubspot.$return_value
          .salesforce_hubspot_line_item_id[0][1];

      const create_json = {
        Hubspot_Line_Item_ID__c: hs_line_item_id,
        PD_Synch__c: true,
      };

      const update_json = {
        PD_Synch__c: true,
      };

      console.log(hs_line_item_id);
      if (hs_line_item_id != "NA") {
        console.log("Updating line item and synch status");
        await update_sf(sf_deal_id, create_json);
      } else {
        console.log("Skipping line item update and updating synch status");
        await update_sf(sf_deal_id, update_json);
      }
    } else {
      console.log("Line item creation process did not run");
    }
  },
});
