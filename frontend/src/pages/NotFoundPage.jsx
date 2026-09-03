import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <ShoppingBag size={32} />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The page you are trying to visit does not exist or may have been moved.
      </p>
      <Link to="/">
        <Button variant="primary">
          <ArrowLeft size={16} className="mr-2" /> Return to Store
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
