"use client";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md text-center">
        <p className="mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="btn bg-gray-300 hover:opacity-80 text-black"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="btn hover:opacity-80 text-white"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
