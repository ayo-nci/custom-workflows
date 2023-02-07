// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let history = steps.get_invoice_history.$return_value.HistoryRecords;
    let due_date =
      steps.get_invoice_details.$return_value.Invoices[0].DueDateString;
    //get reminder notes
    let get_reminder_array = history.filter((x) => x.Changes === "Reminders");

    var returnElapsedTime = function (start_date, end_date) {
      let epoch = new Date(end_date) - new Date(start_date);
      //We are assuming that the epoch is in seconds
      var seconds = parseInt(epoch / 1000, 10);

      var days = Math.floor(seconds / (3600 * 24));
      seconds -= days * 3600 * 24;
      var hrs = Math.floor(seconds / 3600);
      seconds -= hrs * 3600;
      var mnts = Math.floor(seconds / 60);
      seconds -= mnts * 60;
      console.log(
        days + "D, " + hrs + "Hrs, " + mnts + "Mins, " + seconds + "Secs"
      );
      return days;
    };
    let reminder_type = get_reminder_array.map((x) =>
      returnElapsedTime(due_date, x.DateUTCString)
    );
    console.log(JSON.stringify(reminder_type));
    return Math.max(...reminder_type);
  },
});
