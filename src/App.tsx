import { Toaster } from 'react-hot-toast';
import './App.css';
import Login from './pages/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import LoaderScreen from './pages/LoaderScreen';
import Layout from './pages/Layout';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

function App() {
  const { loading } = useAuth();
  if (loading) return <LoaderScreen />;
  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path='admin' element={<Admin />} />
            <Route path='dashboard' element={<Dashboard />} />
          </Route>
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/unauthorized' element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
