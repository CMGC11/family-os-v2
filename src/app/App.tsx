import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect } from 'react';
import { ensureDevSession } from '../lib/supabase/devLogin';

export default function App() {

  useEffect(() => {
    ensureDevSession();
  }, []);
  
  return <RouterProvider router={router} />;
}