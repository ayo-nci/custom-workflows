export default defineComponent({
  async run({ steps, $ }) {
    let the_key = steps.trigger.event.id;

    let link = `https://drive.google.com/uc?id=${the_key}&export=download`;
    // Reference previous step data using the steps object and return data to use it in future steps
    return link;
  },
});
