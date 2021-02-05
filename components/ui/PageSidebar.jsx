// =============================================================================
// IMPORTS
// =============================================================================
import { List, ListItem, ListItemText } from '@material-ui/core';
import { useUser } from '../utils/auth/useUser'

const menuConfig = [
    { name: "Dashboard", url: "/" },
    { name: "Clients", url: "/clients" },
]

// =============================================================================
// RENDER
// =============================================================================
const Sidebar = ({ menuOpen }) => {
    
    return (
        <List component="nav" aria-label="secondary mailbox folders" style={{ display: menuOpen ? 'block' : 'none' }}>
            {
                menuConfig.map(entry => {
                    return (
                        <ListItemLink href={entry.url} key={entry.url}>
                            <ListItemText primary={entry.name} />
                        </ListItemLink>
                    )
                })
            }
        </List>
    )
}


const ListItemLink = (props) => {
    return <ListItem button component="a" {...props} />;
}


export default Sidebar