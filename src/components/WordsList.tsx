import React, { useState, useEffect } from 'react'
import { supabase, Word } from '../lib/supabase'
import { WordCard } from './WordCard'
import { BookOpen, Plus, Search, LogOut } from 'lucide-react'

export const WordsList: React.FC = () => {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [newWord, setNewWord] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [newExample, setNewExample] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('swyw_words')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWords(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) return
    setSaving(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('swyw_words')
        .insert([{ word_or_phrase: newWord.trim(), meaning: newMeaning.trim() || null, example_sentence: newExample.trim() || null }])
        .select()
        .single()
      if (error) throw error
      setWords([data, ...words])
      setNewWord('')
      setNewMeaning('')
      setNewExample('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('swyw_words')
        .delete()
        .eq('id', id)

      if (error) throw error
      setWords(words.filter(word => word.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear any local storage/session storage
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('userSession')
      sessionStorage.removeItem('userSession')
      
      // Redirect to login page or reload the page
      window.location.href = '/'
    } catch (error: any) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error
      window.location.href = '/'
    }
  }

  const filteredWords = words.filter(word =>
    word.word_or_phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (word.example_sentence && word.example_sentence.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your words...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-900 ml-3">SWYW</h1>
              <span className="ml-2 text-sm text-gray-500">Language Learning</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleAddWord} className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Word or Phrase<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter word or phrase"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meaning<span className="text-gray-400"> (optional)</span></label>
            <input
              type="text"
              value={newMeaning}
              onChange={e => setNewMeaning(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter meaning"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Example Sentence (optional)</label>
            <input
              type="text"
              value={newExample}
              onChange={e => setNewExample(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter example sentence"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newWord.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Saved Words</h2>
              <p className="text-gray-600 mt-1">
                {words.length} {words.length === 1 ? 'word' : 'words'} saved
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No words found' : 'No words saved yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start building your vocabulary by adding words with the Chrome extension'
              }
            </p>
            {!searchTerm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center text-blue-800">
                  <Plus className="mr-2" size={16} />
                  <span className="font-medium">Install Chrome Extension</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Use our Chrome extension to easily save words while browsing
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => (
              <WordCard key={word.id} word={word} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}