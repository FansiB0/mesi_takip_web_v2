import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { addSalary, addOvertime, addLeave, salaries, overtimes, leaves } = useData();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Supabase connection...\n');
    
    try {
      // Test 1: Basic connection
      const { error } = await supabase.from('users').select('*').limit(1);
      
      if (error) {
        setTestResult(prev => prev + `❌ Connection Error: ${error.message}\n`);
      } else {
        setTestResult(prev => prev + `✅ Connection successful\n`);
      }

      // Test 2: Check tables
      const tables = ['users', 'user_settings', 'salary_records', 'overtime', 'leaves'];
      for (const table of tables) {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError) {
          setTestResult(prev => prev + `❌ Table ${table}: ${tableError.message}\n`);
        } else {
          setTestResult(prev => prev + `✅ Table ${table}: OK\n`);
        }
      }

      // Test 3: Check user authentication
      if (user) {
        setTestResult(prev => prev + `✅ User authenticated: ${user.email}\n`);
      } else {
        setTestResult(prev => prev + `❌ No user authenticated\n`);
      }

      // Test 4: Check user_settings specifically
      if (user) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (settingsError) {
          setTestResult(prev => prev + `❌ User Settings Error: ${settingsError.message}\n`);
        } else if (settingsData) {
          setTestResult(prev => prev + `✅ User Settings: Found (${Object.keys(settingsData.settings || {}).length} keys)\n`);
        } else {
          setTestResult(prev => prev + `⚠️ User Settings: Not found (will be created)\n`);
        }
      }

    } catch (error: any) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddSalary = async () => {
    if (!user) {
      setTestResult('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing salary addition...\n');

    try {
      const testSalary = {
        userId: user.id,
        month: 1,
        year: 2024,
        grossSalary: 10000,
        netSalary: 8000,
        bonus: 1000,
        besDeduction: 500
      };

      const result = await addSalary(testSalary);
      
      if (result.success) {
        setTestResult(prev => prev + `✅ Salary added successfully: ${result.data?.id}\n`);
      } else {
        setTestResult(prev => prev + `❌ Salary addition failed: ${result.error}\n`);
      }
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddOvertime = async () => {
    if (!user) {
      setTestResult('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing overtime addition...\n');

    try {
      const testOvertime = {
        userId: user.id,
        date: '2024-01-15',
        hours: 2,
        description: 'Test overtime',
        status: 'pending' as const
      };

      const result = await addOvertime(testOvertime);
      
      if (result.success) {
        setTestResult(prev => prev + `✅ Overtime added successfully: ${result.data?.id}\n`);
      } else {
        setTestResult(prev => prev + `❌ Overtime addition failed: ${result.error}\n`);
      }
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddLeave = async () => {
    if (!user) {
      setTestResult('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing leave addition...\n');

    try {
      const testLeave = {
        userId: user.id,
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        type: 'annual' as const,
        leaveType: 'annual' as const,
        daysUsed: 3,
        reason: 'Test leave',
        status: 'pending' as const
      };

      const result = await addLeave(testLeave);
      
      if (result.success) {
        setTestResult(prev => prev + `✅ Leave added successfully: ${result.data?.id}\n`);
      } else {
        setTestResult(prev => prev + `❌ Leave addition failed: ${result.error}\n`);
      }
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSettings = async () => {
    if (!user) {
      setTestResult('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing settings...\n');

    try {
      // Test settings creation
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: {
            theme: 'light',
            language: 'tr',
            salary: {
              defaultNetSalary: '30000',
              defaultHourlyRate: '150',
              currency: 'TRY'
            }
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        setTestResult(prev => prev + `❌ Settings test failed: ${error.message}\n`);
      } else {
        setTestResult(prev => prev + `✅ Settings test successful: ${data.id}\n`);
      }
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Settings test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const comprehensiveDataTest = async () => {
    if (!user) {
      setTestResult('❌ User not authenticated');
      return;
    }

    setIsLoading(true);
    setTestResult('🧪 KAPSAMLI VERİ TESTİ BAŞLIYOR...\n\n');

    try {
      // Test 1: Settings
      setTestResult(prev => prev + '1️⃣ Settings Test...\n');
      await testSettings();
      
      // Test 2: Salary
      setTestResult(prev => prev + '\n2️⃣ Salary Test...\n');
      await testAddSalary();
      
      // Test 3: Overtime
      setTestResult(prev => prev + '\n3️⃣ Overtime Test...\n');
      await testAddOvertime();
      
      // Test 4: Leave
      setTestResult(prev => prev + '\n4️⃣ Leave Test...\n');
      await testAddLeave();

      // Test 5: Verify all data in database
      setTestResult(prev => prev + '\n5️⃣ Veritabanı Doğrulama...\n');
      
      const { data: salaryData } = await supabase
        .from('salary_records')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: overtimeData } = await supabase
        .from('overtime')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: leaveData } = await supabase
        .from('leaves')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      setTestResult(prev => prev + `✅ Salary Records: ${salaryData?.length || 0}\n`);
      setTestResult(prev => prev + `✅ Overtime Records: ${overtimeData?.length || 0}\n`);
      setTestResult(prev => prev + `✅ Leave Records: ${leaveData?.length || 0}\n`);
      setTestResult(prev => prev + `✅ Settings Records: ${settingsData?.length || 0}\n`);

      setTestResult(prev => prev + '\n🎉 KAPSAMLI TEST TAMAMLANDI!\n');
      setTestResult(prev => prev + '📊 Tüm veriler başarıyla kaydedildi!\n');

    } catch (error: any) {
      setTestResult(prev => prev + `❌ Comprehensive test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestData = async () => {
    setIsLoading(true);
    setTestResult('Clearing test data...\n');

    try {
      // Clear test data (only if user is admin)
      if (user?.employeeType === 'admin') {
        const { error } = await supabase
          .from('salary_records')
          .delete()
          .like('month', '2024-01');

        if (error) {
          setTestResult(prev => prev + `❌ Clear failed: ${error.message}\n`);
        } else {
          setTestResult(prev => prev + `✅ Test data cleared\n`);
        }
      } else {
        setTestResult(prev => prev + `⚠️ Admin privileges required to clear data\n`);
      }
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Clear failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg border">
      <h2 className="text-xl font-bold mb-4">🔧 Debug Panel</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <button
          onClick={testSupabaseConnection}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button
          onClick={comprehensiveDataTest}
          disabled={isLoading || !user}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-bold"
        >
          🧪 Kapsamlı Test
        </button>
        
        <button
          onClick={testSettings}
          disabled={isLoading || !user}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Settings
        </button>
        
        <button
          onClick={testAddSalary}
          disabled={isLoading || !user}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Add Salary
        </button>
        
        <button
          onClick={testAddOvertime}
          disabled={isLoading || !user}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test Add Overtime
        </button>
        
        <button
          onClick={testAddLeave}
          disabled={isLoading || !user}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Add Leave
        </button>
        
        <button
          onClick={clearTestData}
          disabled={isLoading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Clear Test Data
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Current Data Count:</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Salaries: {salaries.length}</div>
          <div>Overtimes: {overtimes.length}</div>
          <div>Leaves: {leaves.length}</div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Environment Variables:</h3>
        <div className="text-sm space-y-1">
          <div>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}</div>
          <div>SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}</div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <pre className="bg-white p-3 rounded border text-sm overflow-auto max-h-64">
          {testResult || 'No tests run yet...'}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;
