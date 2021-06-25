import React, { useState, useEffect } from 'react'
import fire from '../config/fire-config'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'


const Home = () => {
  const [summaries, setSummaries] = useState([])
  const [articles, setArticles] = useState([])
  const yesterday = moment().subtract(1, 'days').format('MM-D-y')
  const today = moment().format('MM-D-y')
  
  useEffect(() => {
    
    const trendQuery = fire.firestore().collection('trends').where(fire.firestore.FieldPath.documentId(), '>=', today)
    const yesterdayQuery = fire.firestore().collection('trends').where(fire.firestore.FieldPath.documentId(), '>=', yesterday).where(fire.firestore.FieldPath.documentId(), '<=', today)
    const articleQuery = fire.firestore().collection('articles')

    trendQuery.get().then((documentSnapshots) => {
      const summaries = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setSummaries(summaries)
    })
    articleQuery.get().then((documentSnapshots) => {
      const articles = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setArticles(articles)
    })

  }, [])

  function toggleContext(e) {
    e.preventDefault();
    const context = e.currentTarget.nextElementSibling
    context.classList.toggle('hidden')
    e.currentTarget.classList.add('hidden')
  }

  return (
    <>
      <section className='hero'>
        <h1>Diagram News</h1>
        <h4>Minimal news summaries written by journalists and <a href='https://beta.openai.com/'>GPT-3</a></h4>
      </section>
      {summaries.map(summary =>
        <section className='summary'>
          <h4 className='headline'>{summary.trend}</h4>
          <ReactMarkdown>{summary.summary.replaceAll('- ', '\n - ').replaceAll('* ', '\n - ')}</ReactMarkdown>
          <button onClick={toggleContext}>View sources</button>
          <div className='context hidden'>
            <p>Sources</p>
            <ul>
              {articles.map(article =>
              article.trend != summary.trend ?
                (null)
              :
                (
                  <li className='source'>
                    <a href={article.url} target='_blank'>{article.headline.replaceAll('<b>','').replaceAll('</b>','').replaceAll('&#39;',"'")}</a>
                  </li>          
                )
              )}
            </ul>
          </div>
        </section>
      )}
      {/* <button className='pagination'>Read Yesterday's Stories</button> */}
    </>
  )
}

export default Home