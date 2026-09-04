import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, Package, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileBottomNav = () => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#2874f0]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Home size={20} className="mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#2874f0]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Grid size={20} className="mb-0.5" />
        <span>Categories</span>
      </NavLink>

      <NavLink
        to="/account?tab=wishlist"
        className={({ isActive }) =>
          `relative flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#2874f0]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <div className="relative">
          <Heart size={20} className="mb-0.5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center">
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </span>
          )}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#2874f0]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Package size={20} className="mb-0.5" />
        <span>Orders</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `relative flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[#2874f0]' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <div className="relative">
          <ShoppingCart size={20} className="mb-0.5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#fb641b] text-[9px] font-black text-white flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
