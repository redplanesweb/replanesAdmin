import { useUser } from '../components/utils/auth/useUser'
import PageTemplate from '../components/ui/PageTemplate'


const Home = ({ firebase }) => {
    const { user, logout } = useUser()


    // Return if User is not logged in
    if (!user) return <></>
    return (
        <PageTemplate pageTitle="Dashboard" firebase={firebase} user={user}>
            <h1>Dashboard</h1>
            <p>Future Content</p>
        </PageTemplate>
    )
}

export default Home