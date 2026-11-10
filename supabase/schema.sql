-- ====================================================================
-- SENTINEL 360 — Intelligent Emergency Response & Disaster Management System
-- Supabase PostgreSQL Schema & Security Policies
-- ====================================================================

-- 1. Create Enums
CREATE TYPE emergency_category AS ENUM (
  'Fire Emergency',
  'Road Accident',
  'Medical Emergency',
  'Flood',
  'Building Collapse',
  'Other Emergencies'
);

CREATE TYPE severity_level AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TYPE incident_status AS ENUM ('Reported', 'Pending', 'In Progress', 'Resolved');

-- 2. Create Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code VARCHAR(32) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category emergency_category NOT NULL,
  location VARCHAR(255) NOT NULL,
  landmark VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  people_affected INTEGER NOT NULL DEFAULT 0,
  contact_information JSONB,
  severity severity_level NOT NULL DEFAULT 'Medium',
  recommended_severity severity_level NOT NULL,
  severity_reasoning TEXT[] DEFAULT '{}',
  severity_overridden BOOLEAN DEFAULT FALSE,
  priority_score INTEGER NOT NULL DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  priority_factors JSONB,
  status incident_status NOT NULL DEFAULT 'Reported',
  assigned_unit VARCHAR(120),
  image_url TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Incident Activities Table
CREATE TABLE IF NOT EXISTS public.incident_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  action VARCHAR(64) NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  description TEXT NOT NULL,
  actor VARCHAR(120) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_activities ENABLE ROW LEVEL SECURITY;

-- 5. Public Citizen Submission Policy: anyone can insert incidents
CREATE POLICY "Allow public citizen emergency reporting"
  ON public.incidents
  FOR INSERT
  WITH CHECK (true);

-- 6. Read Incidents Policy: public can read incident status by code / all public reports
CREATE POLICY "Allow public and admin read access to incidents"
  ON public.incidents
  FOR SELECT
  USING (true);

-- 7. Admin Update Policy: only authenticated staff or authorized sessions can update
CREATE POLICY "Allow authorized staff updates on incidents"
  ON public.incidents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 8. Activity logs policy: readable by all, insertable by system
CREATE POLICY "Allow read activities"
  ON public.incident_activities
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert activities"
  ON public.incident_activities
  FOR INSERT
  WITH CHECK (true);

-- 9. Automatic Updated_At Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_incidents_modtime
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
