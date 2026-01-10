-- =====================================================
-- NEWSBOX SERVICE - SAMPLE DATA POPULATION
-- Run this AFTER creating the schema
-- =====================================================

-- Clear existing data (optional, be careful in production!)
-- TRUNCATE comment_votes, post_votes, comments, posts RESTART IDENTITY CASCADE;

-- =====================================================
-- SAMPLE USERS (UUIDs for reference)
-- These should match your auth-service users
-- =====================================================
-- User 1: 11111111-1111-1111-1111-111111111111 (Alice)
-- User 2: 22222222-2222-2222-2222-222222222222 (Bob)
-- User 3: 33333333-3333-3333-3333-333333333333 (Charlie)
-- User 4: 44444444-4444-4444-4444-444444444444 (Diana)

-- =====================================================
-- SAMPLE POSTS
-- =====================================================

-- Post 1: ACCOMMODATION
INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Alice Johnson',
    'Looking for a Roommate - Spring 2025',
    'Hi everyone! I am looking for a roommate for the upcoming spring semester. I have a 2-bedroom apartment near campus (5 min walk). Rent is $600/month including utilities. I prefer someone who is quiet, tidy, and respectful of study hours. Feel free to reach out if interested!',
    ARRAY['https://example.com/apartment1.jpg', 'https://example.com/apartment2.jpg'],
    'ACCOMMODATION',
    NOW() - INTERVAL '2 days'
);

-- Post 2: JOB_POSTING
INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Bob Smith',
    'Part-time Tutor Needed for CS101',
    'Looking for a tutor to help with CS101 (Intro to Programming). Sessions would be 2 hours/week, preferably on weekends. Paying $25/hour. Must have at least a B+ in the course. DM me if interested!',
    ARRAY[]::TEXT[],
    'JOB_POSTING',
    NOW() - INTERVAL '1 day'
);

-- Post 3: LOST_AND_FOUND
INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Charlie Brown',
    'FOUND: AirPods Pro Case near Library',
    'Found an AirPods Pro case near the main library entrance yesterday around 3 PM. It has a blue silicone cover. If this is yours, please describe the case and any identifying marks. I will be at the library tomorrow from 2-4 PM.',
    ARRAY['https://example.com/airpods.jpg'],
    'LOST_AND_FOUND',
    NOW() - INTERVAL '12 hours'
);

-- Post 4: QUERY
INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    'Diana Martinez',
    'Best cafes to study near campus?',
    'Hey everyone! I am new here and looking for some good cafes near campus where I can study. Ideally looking for places with good wifi, not too noisy, and decent coffee. Any recommendations? Thanks in advance!',
    ARRAY[]::TEXT[],
    'QUERY',
    NOW() - INTERVAL '6 hours'
);

-- Post 5: GENERAL
INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'Alice Johnson',
    'Basketball Club Recruitment!',
    'The university basketball club is now accepting new members! No experience required - we welcome beginners and experienced players alike. Practice sessions are every Tuesday and Thursday from 6-8 PM at the main gym. Join us for some fun and fitness! 🏀',
    ARRAY['https://example.com/basketball.jpg'],
    'GENERAL',
    NOW() - INTERVAL '3 hours'
);

-- =====================================================
-- SAMPLE COMMENTS
-- =====================================================

-- Comments on Post 1 (Accommodation)
INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
VALUES (
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Bob Smith',
    'Is the apartment pet-friendly? I have a small cat.',
    NOW() - INTERVAL '1 day 5 hours'
);

INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
VALUES (
    '22222222-aaaa-aaaa-aaaa-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Alice Johnson',
    'Hi Bob! Yes, small pets are allowed. The landlord is fine with cats.',
    NOW() - INTERVAL '1 day 4 hours'
);

-- Comments on Post 4 (Query about cafes)
INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
VALUES (
    '11111111-dddd-dddd-dddd-111111111111',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    'Charlie Brown',
    'Check out "The Brew House" on Main Street! Great wifi and they dont mind if you stay for hours. Their cold brew is amazing.',
    NOW() - INTERVAL '5 hours'
);

INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
VALUES (
    '22222222-dddd-dddd-dddd-222222222222',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Bob Smith',
    'I second The Brew House! Also try "Quiet Corner Cafe" near the engineering building. Its perfect for focused study sessions.',
    NOW() - INTERVAL '4 hours'
);

INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
VALUES (
    '33333333-dddd-dddd-dddd-333333333333',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    'Diana Martinez',
    'Thanks everyone! Will definitely check these out this weekend! 🙏',
    NOW() - INTERVAL '3 hours'
);

-- Comments on Post 5 (Basketball)
INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
VALUES (
    '11111111-eeee-eeee-eeee-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '44444444-4444-4444-4444-444444444444',
    'Diana Martinez',
    'This sounds fun! Do we need to bring our own basketball or is equipment provided?',
    NOW() - INTERVAL '2 hours'
);

-- =====================================================
-- SAMPLE VOTES
-- =====================================================

-- Votes on Post 1 (Accommodation) - 3 upvotes, 1 downvote = +2
INSERT INTO post_votes (id, user_id, post_id, vote_type) VALUES 
    ('10000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UP'),
    ('10000001-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UP'),
    ('10000001-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UP');

-- Votes on Post 2 (Job Posting) - 2 upvotes = +2
INSERT INTO post_votes (id, user_id, post_id, vote_type) VALUES 
    ('10000002-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'UP'),
    ('10000002-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'UP');

-- Votes on Post 3 (Lost and Found) - 5 upvotes = +5
INSERT INTO post_votes (id, user_id, post_id, vote_type) VALUES 
    ('10000003-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'UP'),
    ('10000003-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'UP'),
    ('10000003-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'UP');

-- Votes on Post 4 (Query) - 4 upvotes = +4
INSERT INTO post_votes (id, user_id, post_id, vote_type) VALUES 
    ('10000004-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'UP'),
    ('10000004-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'UP'),
    ('10000004-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'UP');

-- Votes on Post 5 (General/Basketball) - 2 upvotes, 1 downvote = +1
INSERT INTO post_votes (id, user_id, post_id, vote_type) VALUES 
    ('10000005-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'UP'),
    ('10000005-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'UP');

-- =====================================================
-- COMMENT VOTES
-- =====================================================

-- Upvotes on helpful cafe recommendations
INSERT INTO comment_votes (id, user_id, comment_id, vote_type) VALUES 
    ('20000001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '11111111-dddd-dddd-dddd-111111111111', 'UP'),
    ('20000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '11111111-dddd-dddd-dddd-111111111111', 'UP'),
    ('20000001-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', '22222222-dddd-dddd-dddd-222222222222', 'UP');

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the data was inserted correctly:
/*
SELECT 
    p.title,
    p.tag,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
    COALESCE((SELECT SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END) FROM post_votes WHERE post_id = p.id), 0) as vote_count
FROM posts p
ORDER BY p.created_at DESC;
*/
