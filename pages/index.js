import React, { useState, useEffect } from 'react'
import fire from '../config/fire-config'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'


const Home = () => {
  const [summaries, setSummaries] = useState([])
  const [articles, setArticles] = useState([])
  const yesterday = moment().subtract(1, 'days').format('MM-D-y')
  const today = moment().format('MM-D-y')
  
  useEffect(() => {
    
    // const trendQuery = fire.firestore().collection('trends').where(fire.firestore.FieldPath.documentId(), '>=', '06-25-2021')
    const trendQuery = fire.firestore().collection('trends').orderBy('pinned','desc').orderBy('timestamp','desc')
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
      <Head>
        <title>Diagram</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <meta itemprop='description' content='Minimal news summaries.' />

        <meta property='og:url' content='https://www.diagram.news' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='Diagram' />
        <meta property='og:description' content='Minimal news summaries.' />

        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Diagram' />
        <meta name='twitter:description' content='Minimal news summaries.' />
      </Head>
      <section className='hero'>
        <h1>Diagram News</h1>
        <h4>Minimal news summaries written by journalists and <a href='https://beta.openai.com/'>GPT-3</a></h4>
      </section>
      {summaries.map(summary =>
        <section className='summary'>
          {summary.pinned ? <h5 className='pinned-icon'>📌 Developing</h5> : null}
          <h4 className='headline'>{summary.title}</h4>
          {/* <p>{moment(summary.timestamp.toString())}</p> */}
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