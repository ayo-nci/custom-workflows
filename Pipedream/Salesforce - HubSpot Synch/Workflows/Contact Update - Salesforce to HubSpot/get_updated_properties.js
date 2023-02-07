// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    var check_which_update = ["Email", "FirstName", "LastName", "ID"];

    function get_updates(props) {
      var updates = [];
      var prop_count = 0;
      for (var prop of props) {
        if (steps.trigger.event.Old[prop] !== steps.trigger.event.New[prop]) {
          console.log(
            "Old value: " +
              steps.trigger.event.Old[prop] +
              "\t" +
              "New value-" +
              steps.trigger.event.New[prop]
          );
          //  console.log("Prop is "+ prop)
          updates.push(prop);
          prop_count = prop_count + 1;
        }
      }
      console.log("Updated properties are " + updates);
      console.log("Updated properties count is " + prop_count);
      return updates;
    }
    var upd = get_updates(check_which_update);
    if (upd == 0) {
      return 0;
    } else {
      return upd;
    }
  },
});
