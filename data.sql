DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

\c biztime_test

DROP TABLE IF EXISTS invoices
CASCADE;
DROP TABLE IF EXISTS companies
CASCADE;

CREATE TABLE companies
(
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices
(
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT false NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt > (0)
  ::double precision))
);

  INSERT INTO companies
    (code, name, description)
  VALUES
    ('apple', 'Apple Computer', 'Maker of OSX.'),
    ('ibm', 'IBM', 'Big blue.');

  INSERT INTO invoices
    (comp_code, amt, paid, add_date, paid_date)
  VALUES
    ('apple', 100, false, '2018-01-06', null),
    ('apple', 200, false, '2018-01-07', null),
    ('apple', 300, true, '2018-01-05', '2018-01-08'),
    ('ibm', 400, false, '2018-01-09', null);
