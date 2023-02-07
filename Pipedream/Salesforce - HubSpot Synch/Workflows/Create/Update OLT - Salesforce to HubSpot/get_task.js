// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    //Determine if the trigger event emitted is for a creation task or update task
    //and set proper state
    let task = "";
    if (steps.trigger.event.body.Old) {
      task = "update";
    } else if (steps.trigger.event.body.Old == undefined) {
      task = "create";
    } else {
      console.log("Cant determine what task is...");
    }

    // Reference previous step data using the steps object and return data to use it in future steps
    return task;
  },
});
