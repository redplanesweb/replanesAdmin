import { useUser } from '../components/utils/auth/useUser'
import PageTemplate from '../components/ui/PageTemplate'
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Paper, Button } from '@material-ui/core'
import { toast } from 'react-toastify'


const Clients = ({ firebase }) => {
    const { user, logout } = useUser()

    // Return if User is not logged in
    if (!user || !firebase) return <></>
    return (
        <PageTemplate pageTitle="Dashboard" firebase={firebase} user={user}>
            <ClientList user={user} firebase={firebase} />
        </PageTemplate>
    )
}

const ClientList = ({ user, firebase }) => {
    const customersRef = firebase.firestore().collection('customers').where("owned_by", "==", user.id);
    const [customers] = useCollectionData(customersRef, { idField: 'id' })

    return (
        <div>
            <h1>View Clients</h1>
            {
                customers &&
                customers.map(entry => <ClientEntry entry={entry} firebase={firebase} />)
            }
        </div>

    )
}

const ClientEntry = ({ entry, firebase }) => {

    const togglePause = () => {
        firebase.firestore().collection('customers').doc(entry.id).update({
            paused: !entry.paused
        })
            .then(() => {
                console.log("success")
                toast.success("Success", {
                    autoClose: 1000
                })
            })
            .catch(error => {
                toast.error(error.message, {
                    autoClose: 1000
                })
            })
    }

    return (
        <Paper style={{ padding: '1em', margin: '.5em 0', display: 'flex' }}>
            <div>
                <h1>{entry.first_name} {entry.last_name}</h1>
                <p>{entry.plan_id}</p>
                <p>{entry.contact_email}</p>
            </div>
            <span style={{ flex: 1 }}></span>
            <Button color={entry.paused ? "" : "primary"} variant="contained" onClick={togglePause}>{entry.paused ? "unpause" : 'pause'}</Button>
        </Paper>
    )
}



export default Clients