import { useState, useEffect } from 'react'
import fire from '../config/fire-config'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'


const Home = (props) => {
  const [summaries, setSummaries] = useState([])

  useEffect(() => {
    const summaries = fire.firestore().collection('trends')

    summaries.get().then((documentSnapshots) => {
      const summaries = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        trend: doc.data().trend,
        summary: doc.data().summary.replaceAll("- ", '\n - ').replaceAll('* ', '\n - ')
      }))
      setSummaries(summaries)
    })
  }, [props])

  

  return (
    <>
      <section className='hero'>
        <h1>Diagram News</h1>
        <p>A minimalistic news summary app that runs on GPT-3.</p>
      </section>    
      <section className='summary'>
        {summaries.map(summary =>
          <>
            <h3>{summary.trend}</h3>
            <ReactMarkdown>{summary.summary}</ReactMarkdown>
            <button>Go deeper</button>
          </>  
        )}
      </section>
      <button className='pagination'>Read Yesterday's Stories</button>
    </>
  )
}

export default Home
