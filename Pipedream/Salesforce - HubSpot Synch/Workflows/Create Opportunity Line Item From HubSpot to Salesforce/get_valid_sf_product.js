import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    const check_product = async (the_item_name) => {
      let soql_search_string = `
                    SELECT 
                      Id, 
                      Name,
                      Product2Id,
                      UnitPrice
                    FROM PricebookEntry 
                    WHERE name like '${the_item_name}'
                `;

      try {
        let soql_req = await axios($, {
          url: `${
            this.salesforce_rest_api.$auth.instance_url
          }/services/data/v30.0/query/?q=${encodeURIComponent(
            soql_search_string
          )}`,
          headers: {
            Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
          },
        });

        if (soql_req.totalSize > 0) {
          let resp_arr = ["valid", soql_req.records];

          return resp_arr;
        } else if (soql_req.totalSize === 0) {
          return ["invalid"];
        } else {
          console.log(soql_req);
          return [null];
        }
      } catch (error) {
        console.log("Error occured during search...\n" + error);

        return [null];
      }
    };

    var item_names_arr = [];
    var valid_product = [];

    //Check if deal has line items by checking length of deal item array
    if (steps.trigger.event.body.deal_line_items.length !== 0) {
      // steps.trigger.event.body.deal_line_items.forEach(function(index)
      for (
        let i = 0;
        i < steps.trigger.event.body.deal_line_items.length;
        i++
      ) {
        //Extract line item names
        console.log(
          "LT is " + steps.trigger.event.body.deal_line_items[i].name
        );
        let item_name = steps.trigger.event.body.deal_line_items[i].name;
        item_names_arr.push(item_name);
      }

      //Check if line item is a valid product on pricebook
      for (var item_name of item_names_arr) {
        let is_valid_product = await check_product(item_name);
        if (is_valid_product[0] !== null && is_valid_product[0] === "valid") {
          valid_product.push(is_valid_product[1]);
        } else {
          console.log(item_name + " is not a valid product on Salesforce.");
          //Create product????
        }
      }

      console.log("Valids are " + JSON.stringify(valid_product));
    } else {
      console.log("Opportunity does not have line items");
    }

    let unique_valid_product = [
      ...new Set(valid_product.map(JSON.stringify)),
    ].map(JSON.parse);

    //Return values for synch
    return unique_valid_product;
  },
});
