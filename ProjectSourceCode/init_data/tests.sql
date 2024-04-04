-- USERS
INSERT INTO users (username, password, profile_pic) VALUES 
('user1', 'password123', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkr4HamH6evM84k6_hAyVYfJadO6cDUb7PdV-XFY289A&s'),
('user2', 'abc123', 'https://i.scdn.co/image/ab6761610000e5ebe1408498d7f528e3671616b1'),
('user3', 'pass456', 'https://i1.sndcdn.com/artworks-98qVE3EdZLVbRuQl-oqoDXA-t500x500.jpg');

-- POSTS
INSERT INTO posts (author, caption, recipe_id, date_created, image_url, original_flag) VALUES 
('user1', 'Enjoying Pasta Carbonara tonight!', 1, CURRENT_TIMESTAMP, 'pasta.jpg', TRUE),
('user2', 'Indulging in some chocolate goodness!', 2, CURRENT_TIMESTAMP, 'cake.jpg', TRUE),
('user3', 'Grilled salmon for dinner!', 3, CURRENT_TIMESTAMP, 'salmon.jpg', TRUE);

-- RECEPIES
INSERT INTO recipe (title, author, body, date_created) VALUES 
('Pasta Carbonara', 'user1', 'Delicious pasta recipe...', CURRENT_TIMESTAMP),
('Chocolate Cake', 'user2', 'Amazing chocolate cake recipe...', CURRENT_TIMESTAMP),
('Grilled Salmon', 'user3', 'Healthy grilled salmon recipe...', CURRENT_TIMESTAMP);

-- FOLLOWERS
INSERT INTO followers (follower, followee) VALUES 
('user1', 'user2'),
('user2', 'user3'),
('user3', 'user1');

-- LIKES
INSERT INTO likes (post_id, username) VALUES 
(1, 'user2'),
(2, 'user1'),
(3, 'user2'),
(1, 'user3');

-- COMMENTS
INSERT INTO comments (post_id, user, body, date_created) VALUES 
(1, 'user2', 'Looks delicious!', CURRENT_TIMESTAMP),
(2, 'user1', 'Yum! Recipe please?', CURRENT_TIMESTAMP),
(3, 'user2', 'Love salmon!', CURRENT_TIMESTAMP);
