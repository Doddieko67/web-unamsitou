import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('supabase.config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a Supabase client instance', async () => {
    const { supabase } = await import('../supabase.config');

    expect(supabase).toBeDefined();
    expect(supabase).toBeTypeOf('object');
  });

  it('should have auth property with required methods', async () => {
    const { supabase } = await import('../supabase.config');

    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.onAuthStateChange).toBeDefined();
    expect(supabase.auth.resetPasswordForEmail).toBeDefined();
  });

  it('should have database querying capabilities', async () => {
    const { supabase } = await import('../supabase.config');

    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should have storage capabilities', async () => {
    const { supabase } = await import('../supabase.config');

    expect(supabase.storage).toBeDefined();
    expect(supabase.storage.from).toBeDefined();
    expect(typeof supabase.storage.from).toBe('function');
  });

  it('should be the same instance across multiple imports', async () => {
    const { supabase: supabase1 } = await import('../supabase.config');
    const { supabase: supabase2 } = await import('../supabase.config');

    expect(supabase1).toBe(supabase2);
  });

  describe('Auth Methods', () => {
    it('should have signInWithPassword method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.signInWithPassword).toBe('function');
    });

    it('should have signUp method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.signUp).toBe('function');
    });

    it('should have signOut method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.signOut).toBe('function');
    });

    it('should have getSession method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.getSession).toBe('function');
    });

    it('should have onAuthStateChange method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.onAuthStateChange).toBe('function');
    });

    it('should have resetPasswordForEmail method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.resetPasswordForEmail).toBe('function');
    });

    it('should have updateUser method', async () => {
      const { supabase } = await import('../supabase.config');

      expect(typeof supabase.auth.updateUser).toBe('function');
    });
  });

  describe('Database Methods', () => {
    it('should create table query builder', async () => {
      const { supabase } = await import('../supabase.config');

      const tableQuery = supabase.from('test_table');
      expect(tableQuery).toBeDefined();
      expect(typeof tableQuery.select).toBe('function');
      expect(typeof tableQuery.insert).toBe('function');
      expect(typeof tableQuery.update).toBe('function');
      expect(typeof tableQuery.delete).toBe('function');
    });

    it('should support method chaining for queries', async () => {
      const { supabase } = await import('../supabase.config');

      const query = supabase
        .from('test_table')
        .select('*')
        .eq('id', 1);

      expect(query).toBeDefined();
      expect(typeof query.then).toBe('function'); // Should be a Promise-like object
    });
  });

  describe('Storage Methods', () => {
    it('should create storage bucket interface', async () => {
      const { supabase } = await import('../supabase.config');

      const bucket = supabase.storage.from('test_bucket');
      expect(bucket).toBeDefined();
      expect(typeof bucket.upload).toBe('function');
      expect(typeof bucket.download).toBe('function');
      expect(typeof bucket.remove).toBe('function');
      expect(typeof bucket.list).toBe('function');
    });
  });

  describe('Real-time Capabilities', () => {
    it('should have channel method for real-time subscriptions', async () => {
      const { supabase } = await import('../supabase.config');

      expect(supabase.channel).toBeDefined();
      expect(typeof supabase.channel).toBe('function');
    });

    it('should create channel instance', async () => {
      const { supabase } = await import('../supabase.config');

      const channel = supabase.channel('test_channel');
      expect(channel).toBeDefined();
      expect(typeof channel.on).toBe('function');
      expect(typeof channel.subscribe).toBe('function');
      expect(typeof channel.unsubscribe).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent table queries gracefully', async () => {
      const { supabase } = await import('../supabase.config');

      expect(() => {
        supabase.from('non_existent_table');
      }).not.toThrow();
    });

    it('should handle non-existent storage bucket gracefully', async () => {
      const { supabase } = await import('../supabase.config');

      expect(() => {
        supabase.storage.from('non_existent_bucket');
      }).not.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    it('should be properly configured (no undefined methods)', async () => {
      const { supabase } = await import('../supabase.config');

      // Check that core functionality is not undefined
      expect(supabase.auth.signInWithPassword).not.toBeUndefined();
      expect(supabase.auth.signUp).not.toBeUndefined();
      expect(supabase.auth.signOut).not.toBeUndefined();
      expect(supabase.from).not.toBeUndefined();
      expect(supabase.storage.from).not.toBeUndefined();
    });

    it('should have consistent API surface', async () => {
      const { supabase } = await import('../supabase.config');

      // Verify the client has the expected structure
      expect(supabase).toHaveProperty('auth');
      expect(supabase).toHaveProperty('from');
      expect(supabase).toHaveProperty('storage');
      expect(supabase).toHaveProperty('channel');
    });
  });

  describe('Integration Readiness', () => {
    it('should be ready for authentication operations', async () => {
      const { supabase } = await import('../supabase.config');

      // These methods should exist and be callable
      const authMethods = [
        'signInWithPassword',
        'signUp',
        'signOut',
        'getSession',
        'onAuthStateChange',
        'resetPasswordForEmail',
        'updateUser'
      ];

      authMethods.forEach(method => {
        expect(supabase.auth[method]).toBeDefined();
        expect(typeof supabase.auth[method]).toBe('function');
      });
    });

    it('should be ready for database operations', async () => {
      const { supabase } = await import('../supabase.config');

      const tableQuery = supabase.from('users');
      const queryMethods = ['select', 'insert', 'update', 'delete', 'upsert'];

      queryMethods.forEach(method => {
        expect(tableQuery[method]).toBeDefined();
        expect(typeof tableQuery[method]).toBe('function');
      });
    });

    it('should be ready for storage operations', async () => {
      const { supabase } = await import('../supabase.config');

      const bucket = supabase.storage.from('files');
      const storageMethods = ['upload', 'download', 'remove', 'list', 'createSignedUrl', 'getPublicUrl'];

      storageMethods.forEach(method => {
        expect(bucket[method]).toBeDefined();
        expect(typeof bucket[method]).toBe('function');
      });
    });
  });
});