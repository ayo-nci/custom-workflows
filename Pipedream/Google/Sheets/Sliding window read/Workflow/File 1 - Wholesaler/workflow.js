//To use any npm package, just import it
import axios from "axios";
export default defineComponent({
  props: {
    data_store: {
      type: "data_store",
    },
  },
  async run({ steps, $ }) {
    // get by unique identifier
    //Function verify email
    const hapi_key = process.env.Hubspot_Sandbox_API_Token;
    const check_company = async (the_company_id) => {
      const object_type = "COMPANY";
      const hub_url = `https://api.hubapi.com/crm/v3/objects/${object_type}`;

      const company_id = the_company_id;
      const req_url = hub_url + "/search?" + "hapikey=" + hapi_key;

      var body = {
        after: "",
        filterGroups: [
          {
            filters: [
              {
                operator: "EQ",
                propertyName: "customer_number",
                value: company_id,
              },
            ],
          },
        ],
        properties: ["name", "hs_object_id"],
        sorts: [
          {
            propertyName: "name",
            direction: "DESCENDING",
          },
        ],
        query: "",
      };
      try {
        const check_company_resp = await axios({
          method: "post",
          url: req_url,
          header: {
            "Content-Type": "application/json",
          },
          data: body,
        });
        console.log("resp : ", check_company_resp.data);
        if (check_company_resp.data.hasOwnProperty("total")) {
          if (check_company_resp.data.total !== 0) {
            console.log("----Found company");
            return [check_company_resp.data.results[0].id];
          } else if (check_company_resp.data.total === 0) {
            return [0];
          }
        } else {
          console.log("----Serious issue..." + check_company_resp);
        }
      } catch (error) {
        //   console.log("Error is", error.response.data)
        if (error.response) {
          if (error.response.status == 404) {
            return ["Not found"];
          }
        }
        console.log("----Search error:  Status is " + error);
      }
    };
    //Create function
    const create = async (objectType, properties) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";
      const object_type = objectType;
      const req_url = hub_url + object_type + "?" + "hapikey=" + hapi_key;
      try {
        const res = await axios.post(req_url, { properties: properties });
        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.error(
          "----Error - create(" + objectType + "):",
          error.response.status,
          error.response.data
        );
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
          url: `https://api.hubapi.com/crm/v3/objects/${the_from_type}/${the_from_id}/associations/${the_to_type}/${the_to_id}/${the_association_type}?hapikey=${hapi_key}`,
          headers: {
            "Content-Type": "application/json",
          },
        });
        // console.log(response)
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
    //Basic sleep function
    function sleep(milliseconds) {
      const date = Date.now();
      let currentDate = null;
      do {
        currentDate = Date.now();
      } while (currentDate - date < milliseconds);
    }
    //Main function
    var associations_logs = [];

    var company_id;

    let tmp_date = new Date(steps.trigger.event.body.Month);
    let year = new Date().getFullYear();
    let month = tmp_date.getMonth() + 1;
    let lastDay = new Date(year, month, 0);
    let d = new Date(0);
    d.setUTCSeconds(Date.parse(lastDay) / 1000);

    let tmp_id =
      steps.trigger.event.body["Customer Name"] +
      " " +
      steps.trigger.event.body["Postal Code"];

    var company_keys = await this.data_store.get(tmp_id);
    console.log("-------Loading new row------------");
    if (company_keys) {
      console.log("Found parsed company");

      company_id = company_keys;
      console.log("Company ID... " + company_id);
    } else {
      console.log("New company...");
      console.log(
        "Checking hubspot for company, " +
          steps.trigger.event.body["Customer Name"] +
          "\nwith ID " +
          tmp_id
      ); //steps.trigger.event.body["Customer No."])

      var company_search = await check_company(tmp_id);

      console.log("Company id is ", company_search[0]);
      if (company_search[0] === 0) {
        console.log("Company doesn't exist");
        var company_properties = {
          domain: steps.trigger.event.body.Brand + "sandboxx.com",
          name: steps.trigger.event.body["Customer Name"],
          billing_postal_code: steps.trigger.event.body["Postal Code"],
          customer_number: tmp_id,
        };
        console.log("Creating company...");
        company_id = await create("COMPANY", company_properties);
        console.log("----Creation status: " + company_id);
        //Add hubspot id to pipedream datastore
        console.log("Setting company ID for " + tmp_id);

        await this.data_store.set(tmp_id, company_id);
      } else {
        company_id = company_search[0];
        console.log(
          "Company search successful. Setting company ID for " + tmp_id
        );

        await this.data_store.set(tmp_id, company_id);
      }
      console.log("Written back to datastore");
    }
    if (company_id !== 0 && company_id !== null && company_id !== undefined) {
      let tmp_brand = steps.trigger.event.body.Brand;
      //Create deal if company ID exists
      var deal_properties = {
        dealname: steps.trigger.event.body.Product,
        pipeline: "",
        dealstage: "closedwon",
        brand: tmp_brand.toLocaleLowerCase(),
        territory: steps.trigger.event.body.Territory,
        customer_number: steps.trigger.event.body["Customer No."],
        billing_postal_code: steps.trigger.event.body["Postal Code"],
        brick: steps.trigger.event.body.Brick,
        amount: steps.trigger.event.body[" £"],
        closedate: d, //31/06/2022
        source: steps.trigger.event.body.Source,
        old_territory: steps.trigger.event.body["Old Territory"],
        new_territory: steps.trigger.event.body["New Territory"],
      };

      console.log("Creating deal...");
      let deal_id = await create("deal", deal_properties);
      console.log("----Deal status..." + deal_id);
      //Create deal line item if deal ID exists
      if (deal_id) {
        var line_item_properties = {
          name: steps.trigger.event.body.Product,
          quantity: steps.trigger.event.body.PC,
        };
        console.log("Creating line items");
        var line_item_id = await create("line_items", line_item_properties);
        console.log("----Line item status..." + line_item_id);
        if (line_item_id) {
          //Associate line item with deal
          console.log("----Associating line item with deal...");
          var associate_line_item = await associate(
            "line_item",
            line_item_id,
            "deal",
            deal_id,
            "line_item_to_deal"
          );
        } else {
          console.log("----There is no line item ID to associate with...");
        }
        //Associate deal with company
        if (deal_id !== null && company_id !== null) {
          console.log("----Associating deal with company...");
          var associate_deal = await associate(
            "deal",
            deal_id,
            "company",
            company_id,
            "deal_to_company"
          );
        } else {
          //console.log("Error..." + "Deal id is : " + deal_id + "and company id is : " + company_id)
          console.log("Error... null values.");
        }
        associations_logs.push([associate_deal, associate_line_item]);
        console.log("-------Row done------------\n");
      }
    } else {
      console.log("----Some error establishing company.");
    }

    return associations_logs;
  },
});
