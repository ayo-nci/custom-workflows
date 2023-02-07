// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let the_items = steps.trigger.event.body.deal_line_items;
    let the_res = steps.get_valid_sf_product.$return_value;

    //get product names to search for on Salesforce
    function intt(items, res) {
      //get product names of items gotten from Hubspot
      let item_names = [];
      for (var x in items) {
        //get array of names
        item_names.push(items[x].name);
      }
      //get product names to items gotten from search on Salesforce for above product names
      let res_names = [];
      for (var y in res) {
        res_names.push(res[y]["0"].Name);
      }
      //filter for matching product name
      let same = item_names.filter((x) => res_names.includes(x));
      let ind_arr = [];
      //Get the index of the matching product names
      for (var z of same) {
        let ind = item_names.indexOf(z);
        ind_arr.push(ind);
      }
      //Get the items that match via their index from the items from hubspot
      let details_arr = [];
      for (var idd of ind_arr) {
        let dets = items[idd];
        details_arr.push(dets);
      }
      //Loop through the results from the search for items on Salesforce,
      //match product names from hubspot deal items
      //to the appropriate item from SF and get its pricebook ID
      for (var ide in details_arr) {
        console.log("Loop..." + ide);
        console.log("===" + details_arr[ide]["name"]);
        for (var idx in res) {
          if (res[idx]["0"].Name === details_arr[ide]["name"]) {
            console.log("Found");
            console.log(res[idx]["0"].Name + "===" + details_arr[ide]["name"]);
            details_arr[ide]["pricebook_entry_id"] = res[idx]["0"].Id;
          } else {
            console.log("No joy");
            console.log(res[idx]["0"].Name + "===" + details_arr[ide]["name"]);
          }
        }
      }

      return details_arr;
    }

    let to_do = intt(the_items, the_res);

    return to_do;
  },
});
