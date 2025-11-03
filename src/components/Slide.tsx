import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface SlideProps {
  children: ReactNode;
  className?: string;
  direction?: 'forward' | 'backward';
}

/**
 * 単一スライドコンポーネント
 */
export function Slide({ children, className = '', direction = 'forward' }: SlideProps) {
  const variants = {
    enter: {
      x: direction === 'forward' ? 100 : -100,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={`w-full h-screen flex items-center justify-center p-8 ${className}`}
    >
      <div className="max-w-4xl w-full">{children}</div>
    </motion.div>
  );
}
