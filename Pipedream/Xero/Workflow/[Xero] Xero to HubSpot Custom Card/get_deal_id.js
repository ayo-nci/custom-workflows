// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let reference =
      steps.get_invoice_details.$return_value.Invoices[0].Reference;
    console.log(reference);
    let deal_ref = reference.split("-")[0];
    console.log(deal_ref);
    let regex = /[0-9]+/gi;
    if (deal_ref.toLowerCase().startsWith("dealid")) {
      return deal_ref.match(regex)[0];
    } else {
      return 0;
    }
  },
});
