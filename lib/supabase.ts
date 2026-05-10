import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = 'https://ixgikbrmurfwcsrgycce.supabase.co';
const supabaseAnonKey = 'sb_publishable_yjgxBo93e_UwozJj2Qzf5A_nv1RQJQN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据表名
export const TABLES = {
  TRIPS: 'trips',
  EXPENSES: 'expenses',
};
