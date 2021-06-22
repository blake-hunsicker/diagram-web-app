import Footer from '../components/footer'

const Layout = ({children}) => {
  return (
    <>
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout