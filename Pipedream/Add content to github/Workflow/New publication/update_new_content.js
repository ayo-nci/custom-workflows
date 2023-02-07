// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
    async run({ steps, $ }) {
      let new_pub = steps.Parse_new_content.$return_value
      let previous_pub = new Buffer(steps.get_repository_content.$return_value.content, 'base64').toString('ascii')
      return (new_pub + "\n\n" + previous_pub).replace(/[\x00-\x08\x0E-\x1F\x7F-\uFFFF]/g, '');
    },
  })