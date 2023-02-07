// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let ref = steps.get_invoice_details.$return_value.Invoices[0].Reference;
    let inv_num =
      steps.get_invoice_details.$return_value.Invoices[0].InvoiceNumber;
    let invoices = steps.get_invoice_details.$return_value.Invoices[0];

    //Checks if property contains any of the words described in supplier invoice trigger. Returns true if it does
    const multiSearchOr = (text, searchWords) =>
      searchWords.some((el) => {
        // console.log(text)
        console.log(text.toString().toLowerCase().match(new RegExp(el, "i")));
        return text.toString().toLowerCase().match(new RegExp(el, "i"));
      });
    let supplier_invoice_triggers = [
      "personio",
      "expensify",
      "supplier invoice",
    ];

    if (
      ref.toString().toLowerCase().includes("supplier invoice") ||
      inv_num.toString().toLowerCase().includes("expensify")
    ) {
      return $.flow.exit(
        "Ending workflow because this is a supplier invoice..."
      );
    } else if (ref === "" || inv_num === "") {
      if (invoices.LineItems.length > 0) {
        if (
          invoices.LineItems.some((x) =>
            multiSearchOr(x.Description, supplier_invoice_triggers)
          )
        ) {
          return $.flow.exit(
            "Ending workflow because this is a supplier invoice... LI"
          );
        }
      }
    } else {
      console.log("Will process invoice...");
    }
  },
});
