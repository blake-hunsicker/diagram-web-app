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
  const yesterday = moment().subtract(1, 'days').format('MM-D-y')
  const today = moment().format('MM-D-y')
  
  useEffect(() => {
    
    // const trendQuery = fire.firestore().collection('trends').where(fire.firestore.FieldPath.documentId(), '>=', '06-25-2021')
    const trendQuery = fire.firestore().collection('trends').orderBy('pinned','desc').orderBy('timestamp','desc')
    // const trendQuery = fire.firestore().collection('trends').limit(5)
    const articleQuery = fire.firestore().collection('articles')

    articleQuery.get().then((documentSnapshots) => {
      const articles = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setArticles(articles)
    })

    trendQuery.onSnapshot(snapshot => {
      const allSummaries = []
      snapshot.forEach(function(doc) {
        const id = doc.id
        const trend = doc.data().trend
        const summary = doc.data().summary.replaceAll('- ', '\n - ').replaceAll('* ', '\n - ')
        const title = doc.data().title
        const timestamp = doc.data().timestamp.toDate()
        const momentified = moment(timestamp)
        const formattedDate = momentified.format('MM-D-YY')
        const pinned = doc.data().pinned

        days.push(formattedDate)
        
        days[0] == formattedDate ? 
          allSummaries.push(
            <section className='summary'>
              {pinned ? <h5 className='pinned-icon'><PushPin size={16} weight="fill"/> Developing</h5> : null}
              <h2 className='headline'>{title}</h2>
              <ReactMarkdown>{summary}</ReactMarkdown>
              <button onClick={toggleContext}>View sources</button>
              <div className='context hidden'>
                <p>Sources</p>
                <ul>
                  {trend}
                  {articles.map(article =>
                    article.trend == trend ?
                      (<li className='source'>
                        <a href={article.url} target='_blank'>{article.headline.replaceAll('<b>','').replaceAll('</b>','').replaceAll('&#39;',"'")}</a>
                      </li>  )
                    :
                      (
                        null        
                      )
                  )}
                </ul>
              </div>
            </section>
          )
        :
          null
      })

      setSummaries(allSummaries)

      const momentifyDay = moment(days[0])
      const formattedDay = momentifyDay.format('MMMM Do YYYY')
      setLatestDay(formattedDay)
      
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
      <div className='logo'>Diagram</div>
        <div className='value-prop'>
          <p class='info-pill'>Today's 3-5 Most Important News Events ☕️</p>
          <p class='info-pill'>5 Minute Reading Time ⚡️</p>
          <p class='info-pill'>Written by journalists and <a href='https://beta.openai.com/'>GPT-3</a> 🤖</p>
        </div>
        {/* <div className='nav-bar-button'>Sign Up</div> */}
      </section>
      <h3 className='date'>{latestDay}</h3>
      {summaries}
      {/* <button className='pagination'>Read Yesterday's Stories</button> */}
    </>
  )
}

export default Home