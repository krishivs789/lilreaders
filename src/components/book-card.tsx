import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface BookCardProps {
  title: string;
  author: string;
  coverImage: string;
  description: string;
  onClick?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ title, author, coverImage, description, onClick }) => {
  return (
    <motion.div
      className="glass-card p-4 flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
      whileHover={{ scale: 1.03, boxShadow: "0 16px 64px 0 rgba(31, 38, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="relative w-32 h-44 mb-4">
        <Image
          src={coverImage}
          alt={`Cover of ${title}`}
          layout="fill"
          objectFit="cover"
          className="rounded-lg shadow-lg"
        />
      </div>
      <h3 className="text-xl font-bold text-glass-title mb-1">{title}</h3>
      <p className="text-sm text-glass-subtitle mb-2">{author}</p>
      <p className="text-xs text-glass-body overflow-hidden text-ellipsis h-12">{description}</p>
    </motion.div>
  );
};

export default BookCard;
