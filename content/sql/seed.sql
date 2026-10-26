CREATE TABLE campers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER, cabin TEXT);
INSERT INTO campers (name, age, cabin) VALUES
  ('Ada', 12, 'Pine'), ('Grace', 11, 'Oak'), ('Linus', 13, 'Pine'), ('Margaret', 12, 'Birch'),
  ('Alan', 10, 'Oak'), ('Barbara', 13, 'Birch'), ('Dennis', 11, 'Pine'), ('Radia', 12, 'Oak');

CREATE TABLE activities (id INTEGER PRIMARY KEY, title TEXT NOT NULL, place TEXT);
INSERT INTO activities (title, place) VALUES
  ('Canoeing', 'Lake'), ('Archery', 'Field'), ('Stargazing', 'Hill'), ('Pottery', 'Barn');

CREATE TABLE signups (camper_id INTEGER REFERENCES campers(id), activity_id INTEGER REFERENCES activities(id));
INSERT INTO signups VALUES (1, 1), (1, 3), (2, 2), (3, 1), (4, 4), (5, 3), (6, 2), (8, 1), (8, 4);
