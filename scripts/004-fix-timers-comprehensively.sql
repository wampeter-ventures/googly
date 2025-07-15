-- This script reviews existing challenge cards and adds timers to those
-- that are clearly time-based but are missing a timer value.
-- This version is more comprehensive based on user feedback.

-- Update based on text descriptions of time
UPDATE challenge_cards
SET timer = 60
WHERE (challenge ILIKE '% one full minute%' OR challenge ILIKE '% a minute%') AND timer IS NULL;

UPDATE challenge_cards
SET timer = 30
WHERE challenge ILIKE '% half a minute%' AND timer IS NULL;

-- Update based on more flexible number-based patterns
UPDATE challenge_cards SET timer = 10 WHERE challenge ILIKE '% 10 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 15 WHERE challenge ILIKE '% 15 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 20 WHERE challenge ILIKE '% 20 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 30 WHERE challenge ILIKE '% 30 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 45 WHERE challenge ILIKE '% 45 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 60 WHERE challenge ILIKE '% 60 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 90 WHERE challenge ILIKE '% 90 seconds%' AND timer IS NULL;
UPDATE challenge_cards SET timer = 120 WHERE challenge ILIKE '% 2 minutes%' AND timer IS NULL;


-- Add a default timer for common "Think Fast" challenge types
UPDATE challenge_cards
SET timer = 20 -- A reasonable default for quick-fire questions
WHERE (challenge ILIKE 'Quickly %' OR challenge ILIKE 'Name %' OR challenge ILIKE 'How many %')
  AND category = 'Think Fast'
  AND timer IS NULL;

-- Add timers for specific challenges that might have been missed
UPDATE challenge_cards
SET timer = 30
WHERE challenge = 'Say the alphabet backwards in under 30 seconds.' AND timer IS NULL;

UPDATE challenge_cards
SET timer = 30
WHERE challenge ILIKE 'Stare into someone''s eyes%' AND timer IS NULL;

-- Specific fix for the user's example
UPDATE challenge_cards
SET timer = 60
WHERE challenge ILIKE 'tiptoe for one full minute%' AND timer IS NULL;
