// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
    async run({ steps, $ }) {
      
  
      let { title, date, venue, url } = steps.trigger.event.body
  
    //  let authors = format(authors)
      const content_format = `- date: ${date.split("T")[0]}
    title: '${title}'
    url: ${url}
    venue: ${venue}`
      return content_format
    },
  })