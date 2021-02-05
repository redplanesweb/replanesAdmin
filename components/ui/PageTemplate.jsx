// =============================================================================
// IMPORTS
// =============================================================================
import Head from 'next/head'
import DashAppBar from './PageAppBar'
import Sidebar from './PageSidebar'
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { toast } from 'react-toastify'
import { Button } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress';

let API_ENDPOINT = "https://us-central1-red-planes-66ada.cloudfunctions.net/widgets/assign-seller"

// =============================================================================
// RENDER
// =============================================================================
const PageTemplate = ({ children, pageTitle, firebase, user }) => {
    const [balance, setBalance] = React.useState(null)

    React.useEffect(() => {
        firebase.firestore().collection('seller_users').doc(user.id).get().then(data => {
            console.log('balance: ', data.data().balance)
            setBalance(data.data().balance)
        })
    }, [])

    return (
        <React.Fragment>
            <Head>
                <title>{pageTitle}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            { balance && <AdminLayout content={children} pageTitle={pageTitle} firebase={firebase} user={user} balance={balance} setBalance={setBalance} />}

        </React.Fragment>
    )
}

// =============================================================================
// RENDER
// =============================================================================
const AdminLayout = ({ content, pageTitle, firebase, user, balance, setBalance }) => {
    const [menuOpen, setMenuOpen] = React.useState(true)
    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = Boolean(anchorEl);

    // Firebase Queue Listener
    const customersRef = firebase.firestore().collection('queue').where("assigned_to", "==", user?.id);
    const [customers] = useCollectionData(customersRef, { idField: 'id' })

    // When a new customer shows up in your queue
    React.useEffect(() => {

        if (customers) {
            console.log(customers)
            customers.forEach(entry => {

                // Prevent Duplicate Toasts and keeps acive toasts
                if (!toast.isActive(entry.id)) {
                    toast(<CustomerToast entry={entry} firebase={firebase} balance={balance} setBalance={setBalance} />, {
                        autoClose: 60000,
                        position: toast.POSITION.BOTTOM_RIGHT,
                        toastId: entry.id,
                        closeOnClick: false,
                        pauseOnFocusLoss: false,
                    })
                }

            })
        }


    }, [customers])

    const handleLogout = () => {
        logout()
        setAnchorEl(null)
    }

    return (
        <main style={{ height: '100vh', overflow: 'hidden' }}>
            <DashAppBar firebase={firebase} setMenuOpen={setMenuOpen} menuOpen={menuOpen} page={pageTitle} balance={balance} />


            <main className="dashboard-main-container dm-panel-two-background" style={{ height: 'calc(100vh - 60px)', gridTemplateColumns: menuOpen ? '275px 1fr' : '0px 1fr' }}>
                <aside className="dashboard-sidebar">
                    <Sidebar menuOpen={menuOpen} />
                </aside>

                <section className="dashboard-right-content dm-body-background" style={{ overflowY: 'scroll' }}>
                    {content}
                </section>
            </main>
        </main>
    )
}

const CustomerToast = ({ entry, firebase, balance, setBalance }) => {
    const [loading, setLoading] = React.useState(false)

    const handleAccept = () => {
        console.log(balance)

        // Check balance
        if (balance < entry.price) {
            alert("Not enough money")
            return
        }

        // Add To Seller
        firebase.firestore().collection('customers').add({
            first_name: entry.first_name,
            last_name: entry.last_name,
            owned_by: entry.assigned_to,
            paused: false,
            plan_id: entry.insurance_id,
            price: entry.price,
            region: entry.region,
            uf: entry.uf,
            contact_email: entry.contact_email
        }).then(() => {

            // Remove from Queue
            firebase.firestore().collection('queue').doc(entry.id).delete()

            // Deduct Balance
            firebase.firestore().collection('seller_users').doc(entry.assigned_to).update({
                balance: balance - entry.price
            })
                .then(() => {
                    setBalance(balance - entry.price)
                })
                .catch(error => {
                    console.log(error.message)
                })

        })


        // Remove from Queue

        // Close Toast
        toast.dismiss(entry.id)
    }

    const handleDecline = () => {
        setLoading(true)

        // Move queue entry to next owner
        let history = entry.history.map(entry => entry)
        history.push(entry.assigned_to)
        let payload = {
            insurance_id: entry.insurance_id,
            contact_email: entry.contact_email,
            price: entry.price,
            region: entry.region,
            uf: entry.uf,
            first_name: entry.first_name,
            last_name: entry.last_name,
            history: history
        }

        console.log(JSON.stringify(payload))

        fetch(API_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                // close toast
                toast.dismiss(entry.id)
                console.log(data)
            })
            .catch(error => {
                console.log(error.message)
                toast.dismiss(entry.id)
            })

    }

    return (
        <div style={{ padding: '1em', display: 'flex', flexDirection: 'column' }}>
            {
                loading && <CircularProgress style={{ justifySelf: 'center', alignSelf: 'center' }} />
            }
            {
                !loading &&
                <>
                    <h1>New Customer!</h1>
                    <p>Price: <span>{entry.price}</span></p>
                    <p>UF: <span>{entry.uf}</span></p>
                    <p>Region: <span>{entry.region}</span></p>

                    <div style={{ margin: '1em 0' }}>
                        <Button size="small" color="primary" variant="contained" style={{ marginRight: '1em' }} onClick={handleAccept}>Accept</Button>
                        <Button onClick={handleDecline} size="small" variant="contained">Decline</Button>
                    </div>
                </>

            }

        </div>
    )
}

export default PageTemplate