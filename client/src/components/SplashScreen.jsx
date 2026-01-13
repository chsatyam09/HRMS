import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50 text-white flex-col"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-8 border-white border-t-transparent rounded-full mb-8"
                />
                <h1 className="text-5xl font-black tracking-tighter">
                    ETHARA<span className="text-blue-200">.AI</span>
                </h1>
                <p className="mt-4 text-xl font-medium opacity-80">HRMS Lite System</p>
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
