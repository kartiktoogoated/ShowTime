import { useState } from 'react';
import { Film, User, Calendar, LogIn } from 'lucide-react';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-purple-500" />
              <span className="font-bold text-xl">ShowTime</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="text-gray-300 hover:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Showtimes</span>
              </button>
              <button className="text-gray-300 hover:text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Navbar;