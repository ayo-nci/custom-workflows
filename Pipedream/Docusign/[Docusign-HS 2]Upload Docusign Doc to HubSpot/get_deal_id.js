// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let custom_field_data =
      steps.trigger.event.body.data.envelopeSummary.customFields
        .textCustomFields;
    let kk = custom_field_data.filter((x) => x.name == "the_deal_id");
    let deal_id = kk[0].value;
    return deal_id;
  },
});
