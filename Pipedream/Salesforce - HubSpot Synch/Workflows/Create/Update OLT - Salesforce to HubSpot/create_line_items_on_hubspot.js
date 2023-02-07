// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    //Create function
    const create = async (objectType, properties) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = objectType;
      const req_url = hub_url + object_type;

      try {
        const res = await axios({
          method: "post",
          url: req_url,
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          data: properties,
        });
        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.log("Error is " + error);
      }
    };
    //update
    const update = async (json, id, the_object_type) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = the_object_type;
      const req_url = hub_url + object_type + "/batch/update/?";
      var body = JSON.stringify({
        inputs: [
          {
            properties: json,
            id: id,
          },
        ],
      });

      try {
        const resp = await axios({
          method: "post",
          url: req_url,
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          data: body,
        });

        if (resp.data.results[0].hasOwnProperty("id")) {
          return resp.data.results[0].id;
        }
      } catch (error) {
        console.log("Error.....", error);
      }
    };

    //Associate function
    const associate = async (
      the_from_type,
      the_from_id,
      the_to_type,
      the_to_id,
      the_association_type
    ) => {
      try {
        var response = await axios({
          method: "put",
          url: `https://api.hubapi.com/crm/v3/objects/${the_from_type}/${the_from_id}/associations/${the_to_type}/${the_to_id}/${the_association_type}`,
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.data) {
          console.log("----No update");
          return null;
        } else if (response.data) {
          console.log("----Association successful");
          return response.data;
        }
      } catch (error) {
        console.log("----Association error is :" + error);
        return null;
      }
    };

    let deal_id =
      steps.get_hubspot_deal_id_.$return_value[0].properties.hs_object_id != 0
        ? steps.get_hubspot_deal_id_.$return_value[0].properties.hs_object_id
        : undefined;

    let association_log = [];
    let salesforce_hubspot_line_item_id = [];
    let logs = {};
    let cell = 0;
    let task = steps.get_task.$return_value;

    console.log(deal_id);

    //main function
    //Create deal line item if deal ID exists
    //Add delay for 15 mins synch
    if (deal_id) {
      let sf_deal_id = steps.trigger.event.body.New.Id;
      let hubspot_line_item_id =
        steps.trigger.event.body.New.Hubspot_Line_Item_ID__c;
      if (hubspot_line_item_id == null && task == "create") {
        var line_item_properties = {
          properties: {
            name: steps.trigger.event.body.New.Name,
            quantity: steps.trigger.event.body.New.Quantity,
            // 'hs_sku': "10",
            price: steps.trigger.event.body.New.UnitPrice,
            description: steps.trigger.event.body.New.Description,
          },
        };

        console.log(JSON.stringify(line_item_properties));

        console.log("Creating line items");
        var line_item_id = await create("line_items", line_item_properties);
        console.log("----Line item status..." + line_item_id);
        if (line_item_id) {
          //Associate line item with deal
          console.log("----Associating line item with deal...");
          console.log(deal_id);
          var associate_line_item = await associate(
            "line_item",
            line_item_id,
            "deal",
            deal_id,
            "line_item_to_deal"
          );
          //send to salesforce Hubspot_Line_Item_ID__c

          association_log.push(associate_line_item);
          salesforce_hubspot_line_item_id.push([sf_deal_id, line_item_id]);
        } else {
          console.log("----There is no line item ID to associate with...");
        }
      } else if (deal_id && task == "update") {
        console.log("Item " + sf_deal_id + " exists on Hubspot ");

        console.log("Performing update operation...");
        var upd_obj = {
          name: steps.trigger.event.body.New.Name,
          quantity: steps.trigger.event.body.New.Quantity,
          // 'hs_sku': "10",
          price: steps.trigger.event.body.New.UnitPrice,
          description: steps.trigger.event.body.New.Description,
        };

        console.log("Updating line item on hubspot");
        var update_line_item = await update(
          upd_obj,
          hubspot_line_item_id,
          "line_items"
        );
        console.log("Update id is " + update_line_item);

        salesforce_hubspot_line_item_id.push([sf_deal_id, "NA"]);
      }

      console.log("-------Row done------------\n");
      logs["salesforce_hubspot_line_item_id"] = salesforce_hubspot_line_item_id;
    } else {
      console.log(
        "Error: Deal is " +
          JSON.stringify(steps.get_hubspot_deal_id.$return_value[0])
      );
    }

    return logs;
  },
});
