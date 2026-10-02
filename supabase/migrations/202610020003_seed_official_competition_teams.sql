-- =====================================================================
-- 🏆 INVESTOR FORUM: OFFICIAL COMPETITION TEAMS & MEMBERS SEED SCRIPT
-- =====================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Generated from official: updated creds.xlsx
-- =====================================================================

-- 1. Ensure required columns exist on public.teams
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS participant_type text NOT NULL DEFAULT 'team';
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS leader_name text DEFAULT NULL;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS trader_title text DEFAULT NULL;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS secret_key text DEFAULT NULL;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS secret_key_used boolean NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS secret_key_used_at timestamp with time zone DEFAULT NULL;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS locked_ip text DEFAULT NULL;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS locked_device_info text DEFAULT NULL;

-- 2. Ensure team_members table exists
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Trader',
  email text DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id, created_at asc);

-- 3. Clean previous non-admin participant data (Leaves Admin Command and stocks intact)
DELETE FROM public.portfolio WHERE team_id IN (SELECT id FROM public.teams WHERE is_admin = false);
DELETE FROM public.transactions WHERE team_id IN (SELECT id FROM public.teams WHERE is_admin = false);
DELETE FROM public.team_sessions WHERE team_id IN (SELECT id FROM public.teams WHERE is_admin = false);
DELETE FROM public.team_members;
DELETE FROM public.teams WHERE is_admin = false;

-- 4. Ensure Admin Director Account exists
INSERT INTO public.teams (name, username, password, cash_balance, is_admin, is_banned, participant_type, leader_name)
VALUES ('Admin Command', 'admin', 'admin2026', 0, true, false, 'team', 'Competition Director')
ON CONFLICT (username) DO UPDATE SET password = 'admin2026', is_admin = true, is_banned = false, leader_name = 'Competition Director';

-- 5. Insert Official 25 Competition Trading Teams
INSERT INTO public.teams (name, username, password, cash_balance, is_admin, is_banned, participant_type, leader_name, secret_key, secret_key_used)
VALUES
  ('Alpha Titans', 'team1', 'Titans#869', 100000, false, false, 'team', 'Munatah Azmat (2022028)', 'KEY-01-TITANS', false),
  ('Alpha Phoenix', 'team2', 'Phoenix@329', 100000, false, false, 'team', 'Amna Shahid (1412028)', 'KEY-02-PHOENI', false),
  ('Alpha Mavericks', 'team3', 'Mavericks$240', 100000, false, false, 'team', 'Khadija (2482027)', 'KEY-03-MAVERI', false),
  ('Alpha Falcons', 'team4', 'Falcons!496', 100000, false, false, 'team', 'Nofil Zeeshan (6662028)', 'KEY-04-FALCON', false),
  ('Alpha Raptors', 'team5', 'Raptors#465', 100000, false, false, 'team', 'Ahsan Asif (1092028)', 'KEY-05-RAPTOR', false),
  ('Alpha Spartans', 'team6', 'Spartans@443', 100000, false, false, 'team', 'Muhammad Umar Siddiqui (13332028)', 'KEY-06-SPARTA', false),
  ('Alpha Voyagers', 'team7', 'Voyagers$357', 100000, false, false, 'team', 'Muhammad Soban (1622028)', 'KEY-07-VOYAGE', false),
  ('Alpha Knights', 'team8', 'Knights!319', 100000, false, false, 'team', 'Muhammad Essa (1272028)', 'KEY-08-KNIGHT', false),
  ('Alpha Pioneers', 'team9', 'Pioneers#773', 100000, false, false, 'team', 'Mujtaba Yaseen (13722027)', 'KEY-09-PIONEE', false),
  ('Alpha Apex', 'team10', 'Apex@304', 100000, false, false, 'team', 'Hamza Sadiq (6482028)', 'KEY-10-APEX30', false),
  ('Alpha Guardians', 'team11', 'Guardians$819', 100000, false, false, 'team', 'Muntaha Noor (3362028)', 'KEY-11-GUARDI', false),
  ('Alpha Strikers', 'team12', 'Strikers!647', 100000, false, false, 'team', 'Aayan Faheem (4412028)', 'KEY-12-STRIKE', false),
  ('Alpha Crusaders', 'team13', 'Crusaders#247', 100000, false, false, 'team', 'Zoya Khawar (12182028)', 'KEY-13-CRUSAD', false),
  ('Alpha Dynasty', 'team14', 'Dynasty@245', 100000, false, false, 'team', 'Muhammad Umer (12962028)', 'KEY-14-DYNAST', false),
  ('Alpha Zenith', 'team15', 'Zenith$310', 100000, false, false, 'team', 'Syeda Muneebah (12402028)', 'KEY-15-ZENITH', false),
  ('Alpha Vanguard', 'team16', 'Vanguard!438', 100000, false, false, 'team', 'Minal Fatima (6372027)', 'KEY-16-VANGUA', false),
  ('Alpha Warriors', 'team17', 'Warriors#453', 100000, false, false, 'team', 'Duaa Mariam (5942027)', 'KEY-17-WARRIO', false),
  ('Alpha Eclipse', 'team18', 'Eclipse@732', 100000, false, false, 'team', 'Yusra Fatima (10952028)', 'KEY-18-ECLIPS', false),
  ('Alpha Gladiators', 'team19', 'Gladiators$831', 100000, false, false, 'team', 'Fatima Rizvi (12062028)', 'KEY-19-GLADIA', false),
  ('Alpha Thunder', 'team20', 'Thunder!242', 100000, false, false, 'team', 'Hassaan Karim (1032027)', 'KEY-20-THUNDE', false),
  ('Alpha Matrix', 'team21', 'Matrix#789', 100000, false, false, 'team', 'Muhammad Ahmed (2712027)', 'KEY-21-MATRIX', false),
  ('Alpha Genesis', 'team22', 'Genesis@418', 100000, false, false, 'team', 'Tuleyb (3162028)', 'KEY-22-GENESI', false),
  ('Alpha Velocity', 'team23', 'Velocity$880', 100000, false, false, 'team', 'To Be Assigned', 'KEY-23-VELOCI', false),
  ('Alpha Nexus', 'team24', 'Nexus!773', 100000, false, false, 'team', 'To Be Assigned', 'KEY-24-NEXUS7', false),
  ('Alpha Horizon', 'team25', 'Horizon#644', 100000, false, false, 'team', 'To Be Assigned', 'KEY-25-HORIZO', false);

-- 6. Insert Official Team Members & Assigned Roles
INSERT INTO public.team_members (team_id, name, role, email)
VALUES
  ((SELECT id FROM public.teams WHERE username = 'team1'), 'Munatah Azmat (2022028)', 'Team Leader', 'team1@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team1'), 'Summaiya Baig', 'Member 2', 'team1@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team1'), 'Armish Khan', 'Member 3', 'team1@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team1'), 'Hureba Ejaz', 'Member 4', 'team1@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team1'), 'Zunaira Shoaib', 'Member 5', 'team1@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team2'), 'Amna Shahid (1412028)', 'Team Leader', 'team2@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team2'), 'Maryam Noor', 'Member 2', 'team2@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team2'), 'Khadija Kamran', 'Member 3', 'team2@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team2'), 'Sohan Imran', 'Member 4', 'team2@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team3'), 'Khadija (2482027)', 'Team Leader', 'team3@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team3'), 'Mahnoor Kashif', 'Member 2', 'team3@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team3'), 'Emaan Shahid', 'Member 3', 'team3@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team3'), 'Usman Mahmood', 'Member 4', 'team3@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team4'), 'Nofil Zeeshan (6662028)', 'Team Leader', 'team4@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team4'), 'Muhammad Murtaza Hussain (046)', 'Member 2', 'team4@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team4'), 'Jayant Kumar', 'Member 3', 'team4@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team4'), 'Muhammad Abdul Rehman', 'Member 4', 'team4@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team5'), 'Ahsan Asif (1092028)', 'Team Leader', 'team5@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team5'), 'Muhammad Rafay', 'Member 2', 'team5@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team5'), 'Abdul Ahad', 'Member 3', 'team5@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team5'), 'Essa Khan', 'Member 4', 'team5@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team5'), 'Muhammad Saad', 'Member 5', 'team5@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team6'), 'Muhammad Umar Siddiqui (13332028)', 'Team Leader', 'team6@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team6'), 'Abdul Mustafa Bhiriya', 'Member 2', 'team6@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team6'), 'Ahmed Kamal', 'Member 3', 'team6@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team6'), 'Muhammad Maaz', 'Member 4', 'team6@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team6'), 'Abdul Hadi', 'Member 5', 'team6@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team7'), 'Muhammad Soban (1622028)', 'Team Leader', 'team7@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team7'), 'Hassan Javed', 'Member 2', 'team7@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team7'), 'Afaq Hussain', 'Member 3', 'team7@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team7'), 'Muhammad Naqi', 'Member 4', 'team7@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team7'), 'Rayyan Sami', 'Member 5', 'team7@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team8'), 'Muhammad Essa (1272028)', 'Team Leader', 'team8@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team8'), 'Muhammad Ahmed Tai', 'Member 2', 'team8@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team8'), 'Ahmed Zubair', 'Member 3', 'team8@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team8'), 'Mustafa Gulzar', 'Member 4', 'team8@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team8'), 'Eesa Faisal', 'Member 5', 'team8@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team9'), 'Mujtaba Yaseen (13722027)', 'Team Leader', 'team9@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team9'), 'Huzaifa Talib', 'Member 2', 'team9@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team9'), 'Anas Lakhani', 'Member 3', 'team9@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team9'), 'Hadi Asif', 'Member 4', 'team9@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team9'), 'Abdul Qadir', 'Member 5', 'team9@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team9'), 'Muhib Farhan', 'Member 6', 'team9@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team10'), 'Hamza Sadiq (6482028)', 'Team Leader', 'team10@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team10'), 'Abdul Rehman', 'Member 2', 'team10@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team10'), 'Areeb Aamir', 'Member 3', 'team10@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team10'), 'Muhammad Hassan', 'Member 4', 'team10@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team10'), 'Muhammad Mustafa Godil', 'Member 5', 'team10@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team11'), 'Muntaha Noor (3362028)', 'Team Leader', 'team11@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team11'), 'Abeera Ahmed', 'Member 2', 'team11@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team11'), 'Hiba Fatima', 'Member 3', 'team11@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team11'), 'Amna Faheem', 'Member 4', 'team11@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team11'), 'Sara Umair', 'Member 5', 'team11@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team12'), 'Aayan Faheem (4412028)', 'Team Leader', 'team12@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team12'), 'Usman Faisal', 'Member 2', 'team12@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team12'), 'Hasan Fazeel', 'Member 3', 'team12@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team12'), 'Muhammad Sadiq', 'Member 4', 'team12@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team12'), 'Hamza Saqib', 'Member 5', 'team12@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team13'), 'Zoya Khawar (12182028)', 'Team Leader', 'team13@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team13'), 'Prathna', 'Member 2', 'team13@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team13'), 'Maryam Khan', 'Member 3', 'team13@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team13'), 'Mishal Zehra', 'Member 4', 'team13@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team14'), 'Muhammad Umer (12962028)', 'Team Leader', 'team14@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team14'), 'Muhammad Murtaza Hussain (304)', 'Member 2', 'team14@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team14'), 'Muhammad Rohab', 'Member 3', 'team14@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team14'), 'Muhammad Ibtesam', 'Member 4', 'team14@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team14'), 'Aun Muhammad', 'Member 5', 'team14@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team15'), 'Syeda Muneebah (12402028)', 'Team Leader', 'team15@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team15'), 'Ummehaani Hanif', 'Member 2', 'team15@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team15'), 'Aliza', 'Member 3', 'team15@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team15'), 'Laiba Noor', 'Member 4', 'team15@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team15'), 'Ayesha Shahzad', 'Member 5', 'team15@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team16'), 'Minal Fatima (6372027)', 'Team Leader', 'team16@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team16'), 'Keshika Lalchand', 'Member 2', 'team16@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team16'), 'Areej Ahmed', 'Member 3', 'team16@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team16'), 'Aamena Irfan', 'Member 4', 'team16@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team16'), 'Marwa Nadeem', 'Member 5', 'team16@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team17'), 'Duaa Mariam (5942027)', 'Team Leader', 'team17@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team17'), 'Fatima Yousuf', 'Member 2', 'team17@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team17'), 'Khadija Vistro', 'Member 3', 'team17@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team17'), 'Noorulain Khan', 'Member 4', 'team17@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team18'), 'Yusra Fatima (10952028)', 'Team Leader', 'team18@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team18'), 'Wareesha Shahid', 'Member 2', 'team18@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team18'), 'Wania Arsh', 'Member 3', 'team18@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team18'), 'Muzaina Furqan', 'Member 4', 'team18@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team18'), 'Mariam Aftab', 'Member 5', 'team18@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team19'), 'Fatima Rizvi (12062028)', 'Team Leader', 'team19@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team19'), 'Zairish', 'Member 2', 'team19@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team19'), 'Simrah Khan', 'Member 3', 'team19@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team19'), 'Hira Shuja', 'Member 4', 'team19@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team20'), 'Hassaan Karim (1032027)', 'Team Leader', 'team20@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team20'), 'Musaddiq', 'Member 2', 'team20@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team20'), 'Bilal Malik', 'Member 3', 'team20@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team20'), 'Ali Akbar', 'Member 4', 'team20@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team20'), 'Huda Fatima', 'Member 5', 'team20@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team20'), 'Rameen Fatima', 'Member 6', 'team20@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team21'), 'Muhammad Ahmed (2712027)', 'Team Leader', 'team21@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team21'), 'Anas Ehtasham', 'Member 2', 'team21@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team21'), 'Mustafa Abdullah', 'Member 3', 'team21@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team21'), 'Abdul Haseeb', 'Member 4', 'team21@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team21'), 'Maaz Sufi', 'Member 5', 'team21@alpha.com'),
  ((SELECT id FROM public.teams WHERE username = 'team22'), 'Tuleyb (3162028)', 'Team Leader', 'team22@alpha.com');

-- 7. Reload Schema Cache & Notify Realtime
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';