-- 用户表（用户名+密码登录）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 更新行程表，关联 users 表
ALTER TABLE trips DROP COLUMN IF EXISTS user_id;
ALTER TABLE trips ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 更新费用表，关联 users 表
ALTER TABLE expenses DROP COLUMN IF EXISTS user_id;
ALTER TABLE expenses ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- RLS 策略：用户只能访问自己的数据
CREATE POLICY "Users can view own trips" ON trips FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (user_id = current_setting('app.current_user_id')::uuid);

-- 用户表策略
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (id = current_setting('app.current_user_id')::uuid);
