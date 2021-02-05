import '../styles/globals.css'
import Providers from '../components/ui/Provider'
import { GlobalStyles } from '../styles/global.js'
import firebase from '../components/utils/auth/initFirebase'
import { useUser } from '../components/utils/auth/useUser'
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

function MyApp({ Component, pageProps }) {
  const { user, logout } = useUser()


  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);




  return (
    <React.Fragment>
      <Providers>
        <GlobalStyles />
        <Component {...pageProps} firebase={firebase} />
        <ToastContainer
          className="impct-toast"
          position="bottom-center"
          autoClose={3000}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable={false}
          transition={Slide}
        />
      </Providers>
    </React.Fragment>
  )
}

export default MyApp
