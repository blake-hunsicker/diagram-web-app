import React, { useState, useEffect } from 'react'
import fire from '../config/fire-config'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import { PushPin } from 'phosphor-react'


const Home = () => {
  const [summaries, setSummaries] = useState([])
  const [articles, setArticles] = useState([])
  const [latestDay, setLatestDay] = useState('')
  const days = []
  
  useEffect(() => {
    
    const articleQuery = fire.firestore().collection('articles')

    articleQuery.get().then((documentSnapshots) => {
      let articles = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setArticles(articles)
    })

  }, [])

  useEffect(() => {
    const trendQuery = fire.firestore().collection('trends').orderBy('timestamp','desc')
    trendQuery.onSnapshot(snapshot => {
      const allSummaries = []
      snapshot.forEach(function(doc) {
        const id = doc.id
        const trend = doc.data().trend
        const summary = doc.data().summary.replaceAll('- ', '\n - ').replaceAll('* ', '\n - ')
        const title = doc.data().title
        const timestamp = doc.data().timestamp.toDate()
        const momentified = moment.utc(timestamp)
        const displayDate = momentified.format('MMMM Do')
        const pinned = doc.data().pinned

        days.push(displayDate)
        
        days[0] == displayDate ? 
          allSummaries.push(
            <section className='summary' key={id}>
              {pinned ? <h5 className='pinned-icon'><PushPin size={16} weight="fill"/> Developing</h5> : null}
              <h2 className='headline'>{title}</h2>
              <ReactMarkdown>{summary}</ReactMarkdown>
              <button onClick={toggleContext}>View sources</button>
              <div className='context hidden'>
                <p>Sources</p>
                <ul>
                  {articles.map((article, index) =>
                    article.trend != trend ?
                      null
                    :
                      <li className='source' key={index}>
                        <a href={article.url} target='_blank'>{article.headline.replaceAll('<b>','').replaceAll('</b>','').replaceAll('&#39;',"'")}</a>
                      </li>
                  )}
                </ul>
              </div>
            </section>
          )
        :
          null
      })

      setSummaries(allSummaries)
      setLatestDay(days[0])
  })
}, [articles])

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
        <p>Diagram</p>
        <h1>All the News You Need to Know Today</h1>
        <div className='value-prop'>
          <p className='info-pill'>{summaries.length} Updates for {latestDay} ⚡️</p>
          <p className='info-pill'>Written by Journalists and <a href='https://beta.openai.com/'>GPT-3</a> 🤖</p>
        </div>
      </section>
      {/* <h4 class='date'>{latestDay}</h4> */}
      {summaries}
      <section className='end-note'>
        <h1>That's it!</h1>
        <p>Come back tomorrow 👋</p>
      </section>
    </>
  )
}

export default Home