// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
    async run({ steps, $ }) {
      
  
      let { title, date, status, authors, journal, arxiv_link, arxiv_id, pdf_link, server, doi, data_uri, url } = steps.trigger.event.body
  
     // console.log( title, date, status, authors, journal)
  
    //  let authors = format(authors)
      const publication_format = `- title: >
      ${title}
    date: ${date.split("T")[0]}
    type: 
    status: ${status}
    authors: ${authors.split(", ").map(x=>x.split(" ")).map(x=>x.includes("Birhane") ? "<b>" + x[x.length-1] + ", " +x[0][0] + ".</b>" : x[x.length-1] + ", " +x[0][0] + ".")}
    journal: >
      ${journal}
    arxiv: ${arxiv_link}
    arxiv_id: ${arxiv_id}
    pdf: ${pdf_link}
    server: ${server}
    doi: ${doi}
    data_uri: ${data_uri}
    url: ${url}`
      return publication_format
    },
  })