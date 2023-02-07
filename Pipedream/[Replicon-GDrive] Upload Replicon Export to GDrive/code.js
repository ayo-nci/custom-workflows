import { DateTime } from "luxon";

export default defineComponent({
  async run({ steps, $ }) {
    const week_number = DateTime.now().weekNumber;
    //console.log(`The current week number is ${week_number}`)

    let filename = steps.trigger.event.attachments[0].filename;
    //-MDW - bill x client x M 2022-08-24.xml
    if (filename.includes("replicon_billing_data")) {
      return `replicon_billing_data` + `_${week_number}`;
    } else if (filename.includes("replicon_remaining_budget")) {
      return `replicon_remaining_budget` + `_${week_number}`;
    } else {
      console.log("Unknown file for dashboard");
      return 0;
    }
  },
});
