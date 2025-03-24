'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TestComponent() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Component</h1>
        <p className="text-gray-500 mb-4">
          This is a test component with explicit styling to verify CSS is working.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
            Blue Card
          </div>
          <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            Green Card
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          Animated Button
        </motion.button>
      </motion.div>
    </div>
  );
} 