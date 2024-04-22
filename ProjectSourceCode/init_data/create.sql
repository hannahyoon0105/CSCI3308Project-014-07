DROP TABLE IF EXISTS users;
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    profile_pic VARCHAR(200)
);
DROP TABLE IF EXISTS recipes;
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(50) NOT NULL REFERENCES users(username),
    body TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL
);
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    author VARCHAR(50) NOT NULL REFERENCES users(username),
    caption VARCHAR(200),
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id),
    date_created TIMESTAMP NOT NULL, 
    image_url VARCHAR(2000) NOT NULL,
    original_flag BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS followers;
CREATE TABLE followers (
    follower VARCHAR(50) NOT NULL REFERENCES users(username),
    followee VARCHAR(50) NOT NULL REFERENCES users(username),
    PRIMARY KEY (follower, followee)
);
DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
    post_id INTEGER NOT NULL REFERENCES posts(post_id),
    username VARCHAR(50) NOT NULL REFERENCES users(username),
    PRIMARY KEY (post_id, username)
);
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(post_id),
    username VARCHAR(50) NOT NULL REFERENCES users(username),
    body TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL
);