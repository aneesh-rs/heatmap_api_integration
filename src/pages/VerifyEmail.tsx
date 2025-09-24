import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { verifyEmail, fetchUserProfile } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import Loader from './LoaderScreen';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Invalid verification link');
      navigate('/login');
      return;
    }
    (async () => {
      setSubmitting(true);
      const res = await verifyEmail(token);
      if (res.success && res.data) {
        // Token stored; fetch profile
        const prof = await fetchUserProfile();
        if (prof.success && prof.data) {
          toast.success('Email verified');
          setUser(prof.data);
          navigate(prof.data.role === 'Admin' ? '/admin' : '/');
        } else {
          toast.error(prof.error || 'Verification failed');
          navigate('/login');
        }
      } else {
        toast.error(res.error || 'Verification failed');
        navigate('/login');
      }
      setSubmitting(false);
    })();
  }, [navigate, searchParams, setUser]);

  if (submitting) return <Loader />;
  return null;
}
