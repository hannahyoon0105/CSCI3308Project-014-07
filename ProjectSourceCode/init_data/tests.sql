-- USERS
/*
INSERT INTO users (username, password, profile_pic) VALUES 
('user1', 'password123', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkr4HamH6evM84k6_hAyVYfJadO6cDUb7PdV-XFY289A&s'),
('user2', 'abc123', 'https://i.scdn.co/image/ab6761610000e5ebe1408498d7f528e3671616b1'),
('user3', 'pass456', 'https://i1.sndcdn.com/artworks-98qVE3EdZLVbRuQl-oqoDXA-t500x500.jpg');

-- RECIPES
INSERT INTO recipes (title, author, body, date_created) VALUES 
('Pasta Carbonara', 'hannah', 'Delicious pasta recipe...', CURRENT_TIMESTAMP),
('Chocolate Cake', 'jonny', 'Amazing chocolate cake recipe...', CURRENT_TIMESTAMP),
('Grilled Salmon', 'hannah', 'Healthy grilled salmon recipe...', CURRENT_TIMESTAMP);

-- POSTS
INSERT INTO posts (author, caption, recipe_id, date_created, image_url, original_flag) VALUES 
('hannah', 'Enjoying Pasta Carbonara tonight!', 1, CURRENT_TIMESTAMP, 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2021/02/05/Baked-Feta-Pasta-4_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1615916524567.jpeg', TRUE),
('jonny', 'Indulging in some chocolate goodness!', 2, CURRENT_TIMESTAMP, 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2021/02/05/Baked-Feta-Pasta-4_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1615916524567.jpeg', TRUE),
('hannah', 'Grilled salmon for dinner!', 3, CURRENT_TIMESTAMP, 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2021/02/05/Baked-Feta-Pasta-4_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1615916524567.jpeg', TRUE);

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
*/
