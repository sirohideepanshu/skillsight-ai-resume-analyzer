-- Run this so recruiters can mark applications as Shortlisted or Rejected.
-- Students then see feedback on their dashboard (Previously Applied Jobs).
--
-- From project root: psql -U your_user -d your_db -f skillsight-backend/migrations/add_application_status.sql

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Applied';

UPDATE applications SET status = 'Applied' WHERE status IS NULL;
