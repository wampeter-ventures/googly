ALTER TABLE challenge_cards
ADD COLUMN modes text[] DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN challenge_cards.modes IS 'Array of modes this card is suitable for, e.g., {eating_together, on_the_couch, outside}';
