const STATUS_BADGES = {
    finished: { label: 'Completed', classes: 'bg-green-50 text-green-700 ring-green-600/20' },
    failed: { label: 'Failed', classes: 'bg-red-50 text-red-700 ring-red-600/20' },
    running: { label: 'In progress', classes: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' },
    interrupted: { label: 'Interrupted', classes: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
};

const badgeFor = (row) => {
    if (row.status === 'finished' || row.status === 'failed') return STATUS_BADGES[row.status];
    // queued/processing: only resumable while the 12h progress cache lives.
    return row.resumable ? STATUS_BADGES.running : STATUS_BADGES.interrupted;
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

/**
 * Import History: every CSV import ever run (persisted in building_imports),
 * with live counts and a Resume action for imports whose progress cache and
 * parked CSV are still available.
 */
export default function BuildingImportHistory({ history = [], onResume, disabled = false }) {
    if (!history.length) return null;

    return (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Import History</h2>
            <p className="text-xs text-gray-500 mb-4">
                Every import is recorded here with its final counts. An interrupted import can be resumed
                for up to 12 hours; after that, re-upload the CSV — already-imported rows are matched by
                name + address, so nothing gets duplicated.
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">File</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Rows</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Created</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Updated</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Skipped</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Errors</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {history.map((row) => {
                            const badge = badgeFor(row);
                            return (
                                <tr key={row.id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{formatDate(row.started_at ?? row.created_at)}</td>
                                    <td className="px-3 py-2 max-w-[220px]">
                                        <p className="truncate font-medium text-gray-900">{row.filename || 'CSV file'}</p>
                                        {row.status === 'failed' && row.message && (
                                            <p className="truncate text-xs text-red-600" title={row.message}>{row.message}</p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badge.classes}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                        {row.processed} / {row.total_rows}
                                    </td>
                                    <td className="px-3 py-2 text-right text-green-700">{row.created_count}</td>
                                    <td className="px-3 py-2 text-right text-blue-700">{row.updated_count}</td>
                                    <td className="px-3 py-2 text-right text-gray-500">{row.skipped_count}</td>
                                    <td className={`px-3 py-2 text-right ${row.error_count > 0 ? 'text-red-700 font-medium' : 'text-gray-500'}`}>
                                        {row.error_count}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {row.resumable && (
                                            <button
                                                type="button"
                                                onClick={() => onResume(row)}
                                                disabled={disabled}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                Resume
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
