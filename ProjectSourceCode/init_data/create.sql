CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    author VARCHAR(50) NOT NULL REFERENCES users(username),
    caption VARCHAR(200),
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id),
    date_created TIMESTAMP NOT NULL, 
    image_url VARCHAR(200) NOT NULL,
    original_flag BOOLEAN NOT NULL
);

CREATE TABLE recipe (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(50) NOT NULL REFERENCES users(username),
    body TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL
);

CREATE TABLE followers (
    follower VARCHAR(50) NOT NULL REFERENCES users(username),
    followee VARCHAR(50) NOT NULL REFERENCES users(username),
    PRIMARY KEY (follower, followee)
);

CREATE TABLE likes (
    post_id INTEGER NOT NULL REFERENCES posts(post_id),
    username VARCHAR(50) NOT NULL REFERENCES users(username),
    PRIMARY KEY (post_id, username)
);

CREATE TABLE comments (
    post_id INTEGER NOT NULL REFERENCES posts(post_id),
    user VARCHAR(50) NOT NULL REFERENCES users(username),
    body TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL
);