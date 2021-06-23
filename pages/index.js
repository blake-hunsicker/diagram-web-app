import { useState, useEffect } from 'react'
import fire from '../config/fire-config'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'


const Home = () => {
  const [summaries, setSummaries] = useState([])

  useEffect(() => {
    const summaries = fire.firestore().collection('trends')

    summaries.get().then((documentSnapshots) => {
      const summaries = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        trend: doc.data().trend,
        summary: doc.data().summary.replaceAll('- ', '\n - ').replaceAll('* ', '\n - '),
        articles: doc.ref.collection('articles').onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            hed: doc.data().headline
          })
        }),
      }))
      setSummaries(summaries)
    })
  }, [])

  console.log(summaries)

  return (
    <>
      <section className='hero'>
        <h1>Diagram News</h1>
        <h4>Minimal news summaries written by journalists and AI.</h4>
      </section>    
        {summaries.map(summary =>
          <>
            <section className='summary'>
              <h3>{summary.trend}</h3>
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
              <button>Go deeper</button>
            </section>
            <div className='context-card'>
              {/* {summary.articles.map(article =>
                <p>{article.headline}</p>
              )} */}
            </div>
          </> 
        )}
      <button className='pagination'>Read Yesterday's Stories</button>
    </>
  )
}

export default Home
