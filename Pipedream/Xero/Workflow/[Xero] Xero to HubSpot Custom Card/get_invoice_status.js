// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let notes_array = steps.get_invoice_history.$return_value.HistoryRecords;

    function get_status(notes_array) {
      const ppaid = (note) => note.Changes === "Partially Paid";
      const paid = (note) => note.Changes === "Paid";
      const view = (note) => note.Changes === "Invoice viewed";
      const sent = (note) => note.Changes === "Invoice sent";

      if (notes_array.some(paid)) {
        return "PAID";
      } else if (notes_array.some(ppaid)) {
        return "PARTIALLY PAID";
      } else if (notes_array.some(view)) {
        return "VIEWED";
      } else if (notes_array.some(sent)) {
        return "SENT";
      } else {
        return 0;
      }
    }

    return get_status(notes_array);
  },
});
