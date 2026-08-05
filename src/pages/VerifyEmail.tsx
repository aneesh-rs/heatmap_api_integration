import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { verifyEmail } from '../services/auth';
import Loader from './LoaderScreen';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(true);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get('token');
    if (!token) {
      toast.error('Invalid verification link');
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      setSubmitting(true);
      const res = await verifyEmail(token);
      localStorage.removeItem('access_token');
      if (res.success) {
        toast.success('Email verified! Please log in.');
        navigate('/login', { replace: true });
      } else {
        toast.error(res.error || 'Verification failed');
        navigate('/login', { replace: true });
      }
      setSubmitting(false);
    })();
  }, [navigate, searchParams]);

  if (submitting) return <Loader />;
  return null;
}
