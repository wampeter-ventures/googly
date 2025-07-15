-- This script reviews existing challenge cards and adds timers to those
    -- that are clearly time-based but are missing a timer value.
    -- It targets specific known cards and also uses general patterns.

    -- Update specific known cards from the initial seed data
    UPDATE challenge_cards
    SET timer = 10
    WHERE challenge = 'Name 3 things that are squishy.' AND timer IS NULL;

    UPDATE challenge_cards
    SET timer = 15
    WHERE challenge = 'Quickly name 4 things you can see right now that are blue.' AND timer IS NULL;

    -- Add timers based on common time-based challenge phrases.
    -- This will catch cards added through the admin panel that follow these patterns.

    -- Pattern: "... for X seconds"
    UPDATE challenge_cards
    SET timer = 30
    WHERE challenge ILIKE '% for 30 seconds%' AND timer IS NULL;

    UPDATE challenge_cards
    SET timer = 60
    WHERE challenge ILIKE '% for 60 seconds%' AND timer IS NULL;

    UPDATE challenge_cards
    SET timer = 15
    WHERE challenge ILIKE '% for 15 seconds%' AND timer IS NULL;

    -- Pattern: "Do X in Y seconds"
    UPDATE challenge_cards
    SET timer = 30
    WHERE challenge ILIKE '% in 30 seconds%' AND category = 'Think Fast' AND timer IS NULL;

    UPDATE challenge_cards
    SET timer = 10
    WHERE challenge ILIKE '% in 10 seconds%' AND category = 'Think Fast' AND timer IS NULL;

    -- Pattern: "Quickly name..."
    UPDATE challenge_cards
    SET timer = 15
    WHERE challenge ILIKE 'Quickly name %' AND timer IS NULL;

    -- Pattern: "Stare into someone's eyes..."
    UPDATE challenge_cards
    SET timer = 30
    WHERE challenge ILIKE 'Stare into someone''s eyes%' AND timer IS NULL;

    -- You can add more specific UPDATE statements here if you find other cards
    -- that need timers. For example:
    --
    -- UPDATE challenge_cards
    -- SET timer = 45
    -- WHERE challenge = 'Build the tallest possible tower using only one hand in 45 seconds.' AND timer IS NULL;
