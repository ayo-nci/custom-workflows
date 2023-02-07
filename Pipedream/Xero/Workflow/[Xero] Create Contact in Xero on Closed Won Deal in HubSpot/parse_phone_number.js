// To use any npm package, just import it
// import axios from "axios"
import { parsePhoneNumber } from "awesome-phonenumber";

export default defineComponent({
  async run({ steps, $ }) {
    let phone_no = steps.trigger.event.body.company_details["Phone Number"];

    if (phone_no != null) {
      let parsed_phone = {};

      const pn = parsePhoneNumber(phone_no);
      console.log(pn);

      if (pn.isMobile) {
        parsed_phone["number"] = pn.getNumber("significant"); // -> '070-712 34 5
        parsed_phone["countrycode"] = pn.getCountryCode();
      } else {
        parsed_phone["number"] = pn.getNumber("national"); // -> '070-712 34 56'
        parsed_phone["regioncode"] = pn.getRegionCode(); // -> 'SE'
        parsed_phone["countrycode"] = pn.getCountryCode();
      }

      return parsed_phone;
    } else {
      console.log("No phone number received");
      return { number: null };
    }
  },
});
