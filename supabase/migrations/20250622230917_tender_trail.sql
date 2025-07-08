/*
  # SWYW Language Learning Database Schema

  1. New Tables
    - `words`
      - `id` (uuid, primary key) - Unique identifier for each saved word/phrase
      - `word_or_phrase` (text, required) - The word or phrase to be memorized
      - `example_sentence` (text, optional) - Example sentence containing the word/phrase
      - `created_at` (timestamp) - When the word/phrase was saved
      - `user_id` (uuid, foreign key) - Links to authenticated user

  2. Security
    - Enable RLS on `words` table
    - Add policy for authenticated users to manage their own words only
    - GDPR compliant: users can only access their own data

  3. Notes
    - Minimal data collection for GDPR compliance
    - User can delete their own words/phrases
    - No tracking or analytics data stored
*/

CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_or_phrase text NOT NULL,
  example_sentence text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own words
CREATE POLICY "Users can manage their own words"
  ON words
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX IF NOT EXISTS words_user_id_idx ON words(user_id);
CREATE INDEX IF NOT EXISTS words_created_at_idx ON words(created_at DESC);