'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Log = Database['public']['Tables']['logs']['Row']

interface LogWithDetails extends Log {
  users?: { email: string } | null
  machines?: { name: string } | null
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(50)
  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
  }, [limit])

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('logs')
      .select('*, users(email), machines(name)')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (data) {
      setLogs(data as any)
    }
    setLoading(false)
  }

  const actionLabels: Record<string, string> = {
    machine_started: '🟢 Gép elindítva',
    session_expired: '⏰ Session lejárt',
    session_finished: '✅ Session befejezve',
    status_changed: '🔄 Állapot változás',
    manual_override: '🔧 Manuális beavatkozás'
  }

  if (loading) {
    return <div className="text-center py-8">Betöltés...</div>
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mr-2">
            Megjelenített sorok:
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 dark:bg-gray-700 dark:text-white"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          🔄 Frissítés
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Időpont
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Felhasználó
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Gép
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Művelet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Részletek
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(log.timestamp).toLocaleString('hu-HU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {log.users?.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {log.machines?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {actionLabels[log.action] || log.action}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {log.details ? (
                    <pre className="text-xs overflow-auto max-w-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

