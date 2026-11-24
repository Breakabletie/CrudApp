//frontend
const { useState, useEffect } = React;
const API_BASE = '/api';
function truncateDescription(text) {
    if (!text) return '';
    if (text.length > 100) { return text.substring(0, 100) + '...'; }
    return text;
}
//navbar
function Navbar({ currentView, setView, currentUser, onLogout }) {
    return (
        <header className="app-header">
            <div className="header">
                <div className="home" onClick={() => setView('all')}>
                    <span className="home-text">Inventory Hub</span>
                </div>

                <nav className="nav-links">
                    <button
                        className={`nav-btn ${currentView === 'all' ? 'active' : ''}`}
                        onClick={() => setView('all')}
                    >
                        All Items
                    </button>
                    {currentUser && (
                        <>
                            <button
                                className={`nav-btn ${currentView === 'my' ? 'active' : ''}`}
                                onClick={() => setView('my')}
                            >
                                My Inventory
                            </button>
                            <button
                                className={`nav-btn ${currentView === 'create' ? 'active' : ''}`}
                                onClick={() => setView('create')}
                            >
                                Add Item
                            </button>
                        </>
                    )}
                </nav>
                <div className="user-nav-actions">
                    {currentUser ? (
                        <div>
                            <span className="greeting">Hi, {currentUser.username}! </span>
                            <button className="logout" onClick={onLogout}>
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button className="to-login" style={{ marginRight: '0.5rem' }} onClick={() => setView('login')}>
                                Log In
                            </button>
                            <button className="register" onClick={() => setView('register')}>
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
//item
function ItemCard({ item, onViewDetail }) {
    const shortDesc = truncateDescription(item.description);
    return (
        <div className="item-card">
            <div>
                <div className="item-body">
                    <h3 className="item-title">{item.itemName}</h3>
                    <span className="badge">Qty: {item.quantity}</span>
                </div>
                <p className="item-desc">{shortDesc}</p>
            </div>
            <div className="item-footer">
                <span className="owner-tag">
                    By: {item.ownerFirstName} {item.ownerLastName}
                </span>
                <button
                    className="details"
                    onClick={() => onViewDetail(item.id)}
                >
                    View Details →
                </button>
            </div>
        </div>
    );
}
//grid
function ItemList({ title, subtitle, items, onViewDetail, showAddButton, onAddClick }) {
    return (
        <section className="view-section">
            <div className="section-header">
                <div>
                    <h2>{title}</h2>
                    <p className="subtitle">{subtitle}</p>
                </div>
                {showAddButton && (
                    <button className="btn btn-primary" onClick={onAddClick}>
                        Add New Item
                    </button>
                )}
            </div>
            <div className="item-grid">
                {items.length === 0 ? (
                    <div className="empty-state">
                        <h3>No items found</h3>
                        <p>There are no items to display in this list.</p>
                    </div>
                ) : (
                    items.map(item => (
                        <ItemCard key={item.id} item={item} onViewDetail={onViewDetail} />
                    ))
                )}
            </div>
        </section>
    );
}
//single item
function ItemDetail({ itemId, currentUser, onBack, onDeleted }) {
    const [item, setItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editQuantity, setEditQuantity] = useState(0);
    const [editDescription, setEditDescription] = useState('');
    //get item details
    const fetchDetail = async () => {
        try {
            const res = await fetch(`${API_BASE}/items/${itemId}`);
            if (!res.ok) return;
            const data = await res.json();
            setItem(data);
            setEditName(data.itemName);
            setEditQuantity(data.quantity);
            setEditDescription(data.description);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchDetail();
    }, [itemId]);
    if (!item) return <p>Loading item details...</p>;
    const isOwner = currentUser && currentUser.id === item.userId;
    //save chagnes
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    itemName: editName,
                    quantity: parseInt(editQuantity, 10),
                    desc: editDescription
                })
            });
            if (!res.ok) return;
            setItem({
                ...item,
                itemName: editName,
                quantity: parseInt(editQuantity, 10),
                description: editDescription
            });
            setIsEditing(false); //toggle back to same page
        } catch (err) {
            console.error(err);
        }
    };
    //delete item
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${item.itemName}"?`)) return;
        try {
            const res = await fetch(`${API_BASE}/items/${item.id}?userId=${currentUser.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) return;

            onDeleted(); //go to user inv
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <section className="view-section">
            <div className="back-to-nav">
                <button className="btn btn-secondary" onClick={onBack}>
                    ← Back to List
                </button>
            </div>
            <div className="detail-item-view">
                {!isEditing ? (
                    <div>
                        <div className="item-counter">
                            <h1>{item.itemName}</h1>
                            <span className="badge">Qty: {item.quantity}</span>
                        </div>
                        <div className="details">
                            <span>Added by: <strong>{item.ownerFirstName} {item.ownerLastName}</strong></span>
                            <span>Item ID: <strong>#{item.id}</strong></span>
                        </div>
                        <div className="desc">
                            <h3>Full Description</h3>
                            <p className="full-description">{item.description}</p>
                        </div>
                        {isOwner && (
                            <div className="edit-btn">
                                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                    Edit Item
                                </button>
                                <button className="delete" onClick={handleDelete}>
                                    Delete Item
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="edit-page">Edit Item Details</h2>
                        <form onSubmit={handleSaveEdit}>
                            <div className="input-field">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <label>Description</label>
                                <textarea
                                    rows="5"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div className="save-changes">
                                <button type="submit" className="btn btn-success">
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
}
//create item-
function CreateItemForm({ currentUser, onCreated, onCancel }) {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    itemName,
                    quantity: parseInt(quantity, 10),
                    desc: description
                })
            });
            if (!res.ok) return;
            onCreated();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <section className="view-section">
            <div className="create-item">
                <h2>Add New Item to Inventory</h2>
                <p className="subtitle">Fill out the details below to publish a new item.</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Ergonomic Office Chair"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Quantity</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 10"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Description</label>
                        <textarea
                            rows="4"
                            placeholder="Add some details about this item..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="submit-cancel">
                        <button type="submit" className="btn btn-primary">
                            Create Item
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
//login
function LoginForm({ onLoginSuccess, onGoRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await res.json();
            if (!res.ok) {
                setErrorMsg(result.error || 'Login failed. Please check your username and password.');
                return;
            }

            onLoginSuccess(result.user);
        } catch (err) {
            console.error(err);
            setErrorMsg('Unable to connect to the server. Please try again later.');
        }
    };

    return (
        <section className="view-section">
            <div className="user-login">
                <h2>Manager Login</h2>
                <p className="subtitle">Log into your account to manage your inventory.</p>

                {errorMsg && (
                    <div className="alert-error">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="e.g. alexj1"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Log In
                    </button>
                </form>

                <p className="to-register">
                    Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onGoRegister(); }}>Create one here</a>.
                </p>
            </div>
        </section>
    );
}
//register
function RegisterForm({ onRegisterSuccess, onGoLogin }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    password
                })
            });
            const result = await res.json();
            if (!res.ok) {
                setErrorMsg(result.error || 'Registration failed. Please try a different username.');
                return;
            }
            onRegisterSuccess(result.user);
        } catch (err) {
            console.error(err);
            setErrorMsg('Unable to connect to the server. Please try again later.');
        }
    };
    return (
        <section className="view-section">
            <div className="user-register">
                <h2>Create an Account</h2>
                <p className="subtitle">Join as an inventory manager to start tracking items.</p>

                {errorMsg && (
                    <div className="alert-error">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>First Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Alex"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Last Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Johnson"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="e.g. alexj1"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Password (will be encrypted)</label>
                        <input
                            type="password"
                            placeholder="Choose a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        Register Account
                    </button>
                </form>
                <p className="to-login">
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>Log in here</a>.
                </p>
            </div>
        </section>
    );
}
//app
function App() {
    const [currentView, setView] = useState('all'); //'all', 'my', 'detail', 'create', 'login', 'register'
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [previousView, setPreviousView] = useState('all');
    const [allItems, setAllItems] = useState([]);
    const [myItems, setMyItems] = useState([]);
    //logged in user
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('inventoryUser');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return null;
    });
    //get all items
    const loadAllItems = async () => {
        try {
            const res = await fetch(`${API_BASE}/items`);
            const data = await res.json();
            setAllItems(data);
        } catch (err) {
            console.error(err);
        }
    };
    //get user items
    const loadMyItems = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch(`${API_BASE}/my-items?userId=${currentUser.id}`);
            const data = await res.json();
            setMyItems(data);
        } catch (err) {
            console.error(err);
        }
    };
    //change viewed items
    useEffect(() => {
        if (currentView === 'all') {
            loadAllItems();
        } else if (currentView === 'my') {
            loadMyItems();
        }
    }, [currentView, currentUser]);
    //login control
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        localStorage.setItem('inventoryUser', JSON.stringify(user));
        setView('my');
    };
    //logout
    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('inventoryUser');
        setView('all');
    };
    const handleViewDetail = (itemId) => {
        setPreviousView(currentView);
        setSelectedItemId(itemId);
        setView('detail');
    };
    return (
        <div>
            <Navbar
                currentView={currentView}
                setView={setView}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <main className="main-container">
                {currentView === 'all' && (
                    <ItemList
                        title="Public Inventory Catalog"
                        subtitle="Browse items shared by all inventory managers."
                        items={allItems}
                        onViewDetail={handleViewDetail}
                        showAddButton={false}
                    />
                )}
                {currentView === 'my' && (
                    <ItemList
                        title="My Inventory Items"
                        subtitle="Manage, edit, or delete items you own."
                        items={myItems}
                        onViewDetail={handleViewDetail}
                        showAddButton={true}
                        onAddClick={() => setView('create')}
                    />
                )}
                {currentView === 'detail' && (
                    <ItemDetail
                        itemId={selectedItemId}
                        currentUser={currentUser}
                        onBack={() => setView(previousView)}
                        onDeleted={() => setView('my')}
                    />
                )}
                {currentView === 'create' && (
                    <CreateItemForm
                        currentUser={currentUser}
                        onCreated={() => setView('my')}
                        onCancel={() => setView('my')}
                    />
                )}
                {currentView === 'login' && (
                    <LoginForm
                        onLoginSuccess={handleLoginSuccess}
                        onGoRegister={() => setView('register')}
                    />
                )}
                {currentView === 'register' && (
                    <RegisterForm
                        onRegisterSuccess={handleLoginSuccess}
                        onGoLogin={() => setView('login')}
                    />
                )}
            </main>
            <footer className="app-footer">
                <p>CRUD Inventory Project &bull; React Front End + ExpressJS Back End + SQLite Database</p>
            </footer>
        </div>
    );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
