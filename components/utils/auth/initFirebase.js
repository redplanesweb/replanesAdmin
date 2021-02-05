import firebase from 'firebase'
import 'firebase/analytics'
import 'firebase/auth'

const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Make sure we are not initializing before window object loads
if (typeof window !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(config)
    if ('measurementId' in config) firebase.analytics()
}

export default firebase