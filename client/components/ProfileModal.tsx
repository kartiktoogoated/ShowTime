import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
  user: {
    name: string;
    email: string;
  };
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, user, onLogout }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-lg overflow-hidden max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="text-gray-300">
          <p className="mb-2">
            <span className="font-semibold">Name: </span>{user.name}
          </p>
          <p className="mb-4">
            <span className="font-semibold">Email: </span>{user.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md"
        >
          Logout
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal;
