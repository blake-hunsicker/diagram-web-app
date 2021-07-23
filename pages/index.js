import React, { useState, useEffect } from 'react'
import fire from '../config/fire-config'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import { PushPin, X } from 'phosphor-react'


const Home = () => {
  const [summaries, setSummaries] = useState([])
  const [articles, setArticles] = useState([])
  const [resources, setResources] = useState([])
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
    
    const resourceQuery = fire.firestore().collection('resources')

    resourceQuery.get().then((documentSnapshots) => {
      let resources = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setResources(resources)
    })

  }, [])

  useEffect(() => {
    const trendQuery = fire.firestore().collection('trends').where('live','==',true).orderBy('timestamp','desc')
    trendQuery.onSnapshot(snapshot => {
      const allSummaries = []
      let resourcesList = []
      snapshot.forEach(function(doc) {
        const id = doc.id
        const trend = doc.data().trend
        const summary = doc.data().summary.replaceAll('- ', '\n - ').replaceAll('* ', '\n - ')
        const title = doc.data().title
        const timestamp = doc.data().timestamp.toDate()
        const momentified = moment.utc(timestamp)
        const displayDate = momentified.format('MMMM Do')
        const pinned = doc.data().pinned
        const resourcesData = doc.data().resources

        days.push(displayDate)
        
        days[0] == displayDate ? 
          allSummaries.push(
            <>
              <section className='summary' key={id}>
                {pinned ? <h5 className='pinned-icon'><PushPin size={16} weight="fill"/> Developing</h5> : null}
                <h2 className='headline'>{title}</h2>
                <ReactMarkdown>{summary}</ReactMarkdown>
                <button onClick={toggleContext}>View sources</button>
              </section>
              <div className='context-wrapper transparent'>
                <div className='context hidden'>
                  <button className='close' onClick={closeContext}><X size={20} weight="bold" /></button>
                  <h4 className='label'>PEOPLE, PLACES, EVENTS</h4>
                  <ul className='resources'>
                    {resources.map((resource, index) =>
                      resourcesData.map(summaryResource => 
                        resource.id != summaryResource ?
                          null
                        :
                          <li className='resource'>
                            <img src={resource.image} />
                            <h4>{resource.title}</h4>
                          </li>
                      )
                    )}
                  </ul>
                  <h4 className='label'>SOURCES</h4>
                  <ul className='sources'>
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
              </div>
              
            </>
          )
        :
          null
      })

      setSummaries(allSummaries)
      setLatestDay(days[0])
      allSummaries.map(({summary, i}) => {
        const number = React.createElement('p', null, i)
      })
  })
}, [articles, resources])

  function toggleContext(e) {
    e.preventDefault();
    const contextWrapper = e.currentTarget.parentElement.nextSibling
    contextWrapper.classList.toggle('transparent')
    contextWrapper.querySelector('.context').classList.toggle('hidden')
  }
  function closeContext(e) {
    e.preventDefault();
    const contextCard = e.currentTarget.parentElement
    console.log('context card:')
    console.log(contextCard)
    const contextWrapper = contextCard.parentElement
    contextCard.classList.add('hidden')
    contextWrapper.classList.add('transparent')
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
      {summaries}
      <section className='end-note'>
        <h1>That's it!</h1>
        <p>Come back tomorrow 👋</p>
      </section>
    </>
  )
}

export default Home