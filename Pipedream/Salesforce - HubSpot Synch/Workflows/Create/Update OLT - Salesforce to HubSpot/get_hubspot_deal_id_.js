import axios from "axios";

export default defineComponent({
  props: {
    // Define that the "db" variable in our component is a data store
    data: { type: "data_store" },
  },
  async run({ $, steps }) {
    //Function to check hubspot
    const check_deal = async (
      the_deal_id,
      the_search_property,
      the_object_type
    ) => {
      const object_type = the_object_type;
      const hub_url = `https://api.hubapi.com/crm/v3/objects/${object_type}`;

      const deal_id = the_deal_id;
      const search_prop = the_search_property;

      const req_url = hub_url + "/search?";

      var body = {
        after: "",
        filterGroups: [
          {
            filters: [
              {
                operator: "EQ",
                propertyName: search_prop,
                value: deal_id,
              },
            ],
          },
        ],

        properties: ["name", "hs_object_id", "pd_synch"],
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
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          data: body,
        });

        console.log("resp : ", check_company_resp.data);

        if (check_company_resp.data.hasOwnProperty("total")) {
          if (check_company_resp.data.total !== 0) {
            console.log("----Found company");
            return [check_company_resp.data.results[0]];
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

    let sf_deal_id = steps.trigger.event.body.New.OpportunityId;

    let run_json_data = {
      sf_deal_id: sf_deal_id,
    };

    const MAX_RETRIES = 5;
    // 4 minutes dely
    const DELAY = 4 * 60 * 1000; //4 mins to ms
    const { run } = $.context;

    // $.context.run.runs starts at 1 and increments when the step is rerun
    if (run.runs === 1) {
      $.flow.rerun(5 * 1000, sf_deal_id, MAX_RETRIES);
    } else if (run.runs === MAX_RETRIES + 1) {
      throw new Error("Max retries exceeded");
    } else {
      let get_deal_id = 0;

      get_deal_id = await check_deal(
        sf_deal_id,
        "hs_salesforceopportunityid",
        "deals"
      );

      // If we're done, continue with the rest of the workflow
      if (get_deal_id[0] !== 0) return get_deal_id;

      // Else retry later
      $.flow.rerun(DELAY, sf_deal_id, MAX_RETRIES);
    }
  },
});
