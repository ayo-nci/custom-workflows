import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    const create_line_item = async (the_product_body) => {
      try {
        let SOBJECT_API_NAME = "OpportunityLineItem";
        let create_req = await axios($, {
          method: "post",
          url: `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/${SOBJECT_API_NAME}`,
          headers: {
            Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
          },
          data: the_product_body,
        });
        console.log("resp is " + JSON.stringify(create_req));
        // console.log("Resp is " + JSON.stringify(soql_req))
        if (create_req.hasOwnProperty("id")) {
          return create_req.id;
        }
      } catch (error) {
        console.log(
          "Error occured creating opportunity line item...\n" + error
        );
        return null;
      }
    };

    var created_line_items_ids_arr = [];
    for (let i = 0; i < steps.get_body_of_valid.$return_value.length; i++) {
      //We are using the values returned from Salesforce for each product
      //instead of the hubspot values
      //Name is not sent because it is an invalid field for insert/update
      var line_item_body_json = {
        //  "Name" : steps.get_body_of_valid.$return_value[i].name,
        Description: steps.get_body_of_valid.$return_value[i].description,
        //    "Discount": 0,//steps.get_body_of_valid.$return_value[i].discount,
        OpportunityId: steps.trigger.event.body.hs_salesforceopportunityid,
        PricebookEntryId:
          steps.get_body_of_valid.$return_value[i].pricebook_entry_id,
        Quantity: steps.get_body_of_valid.$return_value[i].quantity,
        UnitPrice: steps.get_body_of_valid.$return_value[i].price,
        PD_Synch__c: true,
        Hubspot_Line_Item_ID__c:
          steps.get_body_of_valid.$return_value[i].hs_object_id,
      };
      console.log(
        "Creating line item for " +
          steps.get_body_of_valid.$return_value[i].name
      );
      let tmp_line_items_id = await create_line_item(line_item_body_json);
      created_line_items_ids_arr.push(tmp_line_items_id);
    }

    console.log("Valids are " + JSON.stringify(created_line_items_ids_arr));

    //Return created products ID for associating with opportunity
    return created_line_items_ids_arr;

    //Having issues with two pricebooks. Need to configure one for account
    //To fix, set standard price book as active... or ensure you know what pricebook is active.
    //Try setting IsActive to true for products not showing on selected pricebook
  },
});
