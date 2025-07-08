import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { Word } from '../lib/supabase'

interface WordCardProps {
  word: Word
  onDelete: (id: string) => void
}

export const WordCard: React.FC<WordCardProps> = ({ word, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(word.id)
    setIsDeleting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 relative group">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
        title="Delete word"
      >
        <X size={16} />
      </button>
      
      <div className="pr-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
          {word.word_or_phrase}
        </h3>
        {word.meaning && (
          <p className="text-blue-700 mb-2 leading-relaxed">
            {word.meaning}
          </p>
        )}
        {word.example_sentence && (
          <p className="text-gray-700 mb-4 leading-relaxed">
            "{word.example_sentence}"
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={14} className="mr-1" />
          <span>Saved {formatDate(word.created_at)}</span>
        </div>
      </div>
    </div>
  )
}