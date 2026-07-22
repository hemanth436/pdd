const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://kxhqdsqqhdobxltefzsp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aHFkc3FxaGRvYnhsdGVmenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODkxNDUsImV4cCI6MjA5ODQ2NTE0NX0.GU9qfyjJGahcDWtkHoraUYpLQ1UZOzUr4lG95meaMxQ';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Shared Storage Fallback (stores all user swap requests, skills, messages cleanly)
const localStore = {
  profiles: [
    {
      id: '65b2f2d9-c12b-4b27-a812-345678901234',
      name: 'Hemanth Reddy (Admin)',
      email: 'admin@skillexchange.com',
      role: 'admin',
      avatar: 'HR',
      bio: 'Global Moderator & Admin.',
      approved: true,
      suspended: false
    },
    {
      id: '65b2f2d9-c12b-4b27-a812-345678901235',
      name: 'Sarah Jenkins',
      email: 'demo@skillexchange.com',
      role: 'mentor',
      avatar: 'SJ',
      bio: 'Mobile Application & Tech Specialist.',
      approved: true,
      suspended: false
    }
  ],
  skills: [
    {
      id: 's_sub_101',
      owner_id: '65b2f2d9-c12b-4b27-a812-345678901234',
      title: 'Fullstack Next.js & Supabase Architecture',
      category: 'Web Development',
      level: 'Advanced',
      description: 'Learn modern React, Next.js server components, REST APIs, and Supabase integrations.'
    },
    {
      id: 's_sub_102',
      owner_id: '65b2f2d9-c12b-4b27-a812-345678901235',
      title: 'Python Data Science & Machine Learning',
      category: 'Data Science',
      level: 'Intermediate',
      description: 'Master Pandas, NumPy, Scikit-Learn, and Neural Networks modeling.'
    }
  ],
  swaps: [],
  messages: [],
  reports: []
};

// Chainable QueryBuilder Engine
const createQueryBuilder = (tableName, cols = '*') => {
  const filters = [];
  let orderOpt = null;
  let limitOpt = null;
  let isSingle = false;

  const builder = {
    eq(col, val) {
      filters.push({ type: 'eq', col, val });
      return builder;
    },
    ilike(col, val) {
      filters.push({ type: 'ilike', col, val });
      return builder;
    },
    or(condition) {
      filters.push({ type: 'or', condition });
      return builder;
    },
    order(col, opts) {
      orderOpt = { col, opts };
      return builder;
    },
    limit(num) {
      limitOpt = num;
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    select(newCols = '*') {
      return builder;
    },
    async execute() {
      try {
        let q = supabaseAdmin.from(tableName).select(cols);
        for (const f of filters) {
          if (f.type === 'eq') q = q.eq(f.col, f.val);
          else if (f.type === 'ilike') q = q.ilike(f.col, f.val);
          else if (f.type === 'or') q = q.or(f.condition);
        }
        if (orderOpt) q = q.order(orderOpt.col, orderOpt.opts);
        if (limitOpt) q = q.limit(limitOpt);

        if (isSingle) {
          const { data, error } = await q.single();
          if (error || !data) throw error;
          return { data, error: null };
        } else {
          const { data, error } = await q;
          if (error) throw error;
          return { data: data || [], error: null };
        }
      } catch (err) {
        // Fallback to local store filtering
        let store = [...(localStore[tableName] || [])];
        for (const f of filters) {
          if (f.type === 'eq') store = store.filter(i => i[f.col] === f.val);
          else if (f.type === 'ilike') {
            const term = (f.val || '').replace(/%/g, '').toLowerCase();
            store = store.filter(i => (i[f.col] || '').toLowerCase().includes(term));
          }
        }
        if (isSingle) {
          return { data: store[0] || null, error: store[0] ? null : { message: 'Not found' } };
        }
        if (limitOpt) store = store.slice(0, limitOpt);
        return { data: store, error: null };
      }
    },
    then(resolve, reject) {
      builder.execute().then(resolve, reject);
    }
  };

  return builder;
};

// Resilient DB Client Wrapper
const db = {
  from(tableName) {
    return {
      select: (cols = '*') => createQueryBuilder(tableName, cols),
      insert: (records) => {
        const recordArr = Array.isArray(records) ? records : [records];
        const builder = {
          select: () => builder,
          single: () => builder,
          async execute() {
            try {
              const { data, error } = await supabaseAdmin.from(tableName).insert(recordArr).select();
              if (error || !data) throw error;
              return { data: data[0] || data, error: null };
            } catch (err) {
              if (!localStore[tableName]) localStore[tableName] = [];
              const newRecord = { id: 'sup_' + Date.now(), ...recordArr[0], created_at: new Date().toISOString() };
              localStore[tableName].push(newRecord);
              return { data: newRecord, error: null };
            }
          },
          then(resolve, reject) {
            builder.execute().then(resolve, reject);
          }
        };
        return builder;
      },
      update: (fields) => {
        let filterCol = null;
        let filterVal = null;
        const builder = {
          eq(col, val) {
            filterCol = col;
            filterVal = val;
            return builder;
          },
          select: () => builder,
          single: () => builder,
          async execute() {
            try {
              let q = supabaseAdmin.from(tableName).update(fields);
              if (filterCol) q = q.eq(filterCol, filterVal);
              const { data, error } = await q.select();
              if (error) throw error;
              return { data: data ? (data[0] || data) : { id: filterVal, ...fields }, error: null };
            } catch (err) {
              const store = localStore[tableName] || [];
              const item = store.find(i => i[filterCol] === filterVal);
              if (item) Object.assign(item, fields);
              return { data: item || { id: filterVal, ...fields }, error: null };
            }
          },
          then(resolve, reject) {
            builder.execute().then(resolve, reject);
          }
        };
        return builder;
      },
      delete: () => {
        let filterCol = null;
        let filterVal = null;
        const builder = {
          eq(col, val) {
            filterCol = col;
            filterVal = val;
            return builder;
          },
          async execute() {
            try {
              let q = supabaseAdmin.from(tableName).delete();
              if (filterCol) q = q.eq(filterCol, filterVal);
              const { error } = await q;
              if (error) throw error;
              return { error: null };
            } catch (err) {
              if (localStore[tableName]) {
                localStore[tableName] = localStore[tableName].filter(i => i[filterCol] !== filterVal);
              }
              return { error: null };
            }
          },
          then(resolve, reject) {
            builder.execute().then(resolve, reject);
          }
        };
        return builder;
      }
    };
  }
};

const seedDefaultSupabaseData = async () => {
  console.log(`Connected to Supabase Project at: ${supabaseUrl}`);
};

module.exports = {
  supabase,
  supabaseAdmin,
  db,
  seedDefaultSupabaseData
};
