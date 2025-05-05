export default function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDelete,
  isDeleting,
  selectedImages,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  selectedImages: Set<string>;
}) {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg mb-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={selectedCount > 0 && selectedCount === totalCount}
          onChange={onSelectAll}
          className="h-5 w-5"
        />
        <span>
          {selectedCount === 0
            ? `${totalCount} images`
            : `${selectedCount} of ${totalCount} selected`}
        </span>
      </div>
      
      {selectedCount > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : `Delete (${selectedCount})`}
          </button>
          <a
            href={`/api/download?keys=${encodeURIComponent(JSON.stringify(Array.from(selectedImages)))}`}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download ({selectedCount})
          </a>
        </div>
      )}
    </div>
  );
}