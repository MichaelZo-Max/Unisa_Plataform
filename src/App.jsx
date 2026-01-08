import { useState } from 'react';
import Login from './components/Login';
import ManagerDashboard from './components/ManagerDashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {user ? (
        <ManagerDashboard onLogout={handleLogout} currentUser={user} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App
