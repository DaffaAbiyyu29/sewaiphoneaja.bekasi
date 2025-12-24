import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";
import { Switch } from "@headlessui/react";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Inactive":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const CustomerColumns = (onStatusChange) => [
  {
    header: "No",
    render: (_, index) => index + 1,
  },
  {
    header: "Nama Lengkap",
    accessor: "fullname",
    sortable: true,
    render: (row) => row.fullname,
  },
  {
    header: "NIK",
    accessor: "nik",
    sortable: true,
    render: (row) => <span className="font-mono text-sm">{row.nik}</span>,
  },
  {
    header: "Email",
    accessor: "email",
    sortable: true,
    render: (row) => <span className="text-sm">{row.email}</span>,
  },
  {
    header: "Telepon",
    accessor: "telp",
    sortable: true,
    render: (row) => row.telp,
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (row) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
          row.status
        )}`}
      >
        {row.status || "Active"}
      </span>
    ),
  },
  {
    header: "Tanggal Daftar",
    accessor: "created_at",
    sortable: true,
    render: (row) => formatDate(row.created_at),
  },
  {
    header: "Aksi",
    render: (row) => {
      let isActive = row.status === "Active";

      return (
        <div className="flex gap-2 justify-center items-center">
          {/* Tombol Lihat Detail */}
          <button
            onClick={() => getPage("/menu/customer/" + row.customer_id)}
            className="p-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-800 transition duration-150"
            title="Lihat Detail Customer"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          {/* Switch Status */}
          <div className="flex justify-center items-center">
            <label className="flex items-center cursor-pointer gap-2">
              {/* <input
                type="checkbox"
                checked={isActive}
                onChange={() => onStatusChange(row.customer_id, !isActive)}
                className="sr-only peer"
              /> */}
              <Switch
                checked={isActive}
                onChange={() => onStatusChange(row.customer_id, !isActive)}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-blue-600"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
              </Switch>
              {/* <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 relative transition">
                <div className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
              </div> */}
            </label>
          </div>
        </div>
      );
    },
  },
];
