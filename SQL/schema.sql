CREATE USER 'wm'@'localhost' IDENTIFIED BY '';

CREATE DATABASE chat;

GRANT ALL ON *.* TO 'wm'@'localhost';

USE chat;

CREATE TABLE messages (
  id int not null auto_increment,
  user_id int,
  room_id int,
  content text,
  createdAt timestamp,
  updatedAt timestamp,
  primary key (id)
);

CREATE TABLE users (
  id int not null auto_increment,
  name varchar(50) not null,
  primary key (id),
  unique (name)
);

CREATE TABLE rooms (
  id int not null auto_increment,
  name varchar(50) not null,
  primary key (id),
  unique (name)
);
