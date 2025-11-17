"use client";

import React, { useEffect, useState, useCallback, Fragment } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faPlus,
  faSpinner,
  faCheck,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { Listbox, Transition } from "@headlessui/react";
import { getToken } from "../helpers/GetToken";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default function Datatable({
  key,
  apiUrl,
  columns,
  allowAdd = false,
  onAddClick,
  isSearch = true,
  isCard = true,
}) {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [orderBy, setOrderBy] = useState("created_at");
  const [orderDir, setOrderDir] = useState("DESC");
  const [isLoading, setIsLoading] = useState(false);

  const limitOptions = [10, 25, 50, 100];
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: { page, limit, search: debouncedSearch, orderBy, orderDir },
      });

      const apiData = res.data;
      setData(apiData.data || []);
      setTotalPages(apiData.totalPages || 1);
      setTotalDataCount(apiData.totalData || 0);
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalPages(1);
      setTotalDataCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [key, apiUrl, page, limit, debouncedSearch, orderBy, orderDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (accessor) => {
    setPage(1);
    if (orderBy === accessor) {
      setOrderDir(orderDir === "ASC" ? "DESC" : "ASC");
    } else {
      setOrderBy(accessor);
      setOrderDir("ASC");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (page !== 1) setPage(1);
  };

  const currentDataStart = totalDataCount > 0 ? (page - 1) * limit + 1 : 0;
  const currentDataEnd = Math.min(page * limit, totalDataCount);

  const renderPaginationButton = (pageNumber) => (
    <button
      key={pageNumber}
      onClick={() => setPage(pageNumber)}
      className={`px-3 py-1 mx-0.5 rounded-lg text-sm transition ${
        pageNumber === page
          ? "bg-blue-900 text-white font-semibold"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
      }`}
    >
      {pageNumber}
    </button>
  );

  const renderPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= 1) return null;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++)
        pages.push(renderPaginationButton(i));
    } else {
      pages.push(renderPaginationButton(1));
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= maxPagesToShow - 2)
        (start = 2), (end = Math.min(totalPages - 1, maxPagesToShow - 1));
      else if (page > totalPages - (maxPagesToShow - 2))
        (start = Math.max(2, totalPages - (maxPagesToShow - 3))),
          (end = totalPages - 1);

      if (start > 2)
        pages.push(
          <span key="dots1" className="px-2 text-gray-500">
            ...
          </span>
        );
      for (let i = start; i <= end; i++)
        if (i !== 1 && i !== totalPages) pages.push(renderPaginationButton(i));
      if (end < totalPages - 1)
        pages.push(
          <span key="dots2" className="px-2 text-gray-500">
            ...
          </span>
        );
      pages.push(renderPaginationButton(totalPages));
    }

    return pages;
  };

  return (
    <div
      className={`font-inter ${
        isCard ? "p-6 bg-white rounded-xl shadow-lg border border-gray-200" : ""
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* HeadlessUI Listbox for Limit */}
          <Listbox
            value={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          >
            <div className="relative w-28">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition duration-150">
                <span className="block truncate text-center">{limit}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="mr-2 text-xl"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-blue-900 ring-opacity-5 focus:outline-none z-10">
                  {limitOptions.map((val) => (
                    <Listbox.Option
                      key={val}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                        }`
                      }
                      value={val}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate text-center ${
                              selected ? "font-semibold" : "font-normal"
                            }`}
                          >
                            {val}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-900">
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="mr-2 text-xl"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {allowAdd && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white text-sm rounded-lg shadow-md hover:bg-blue-800 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-opacity-50"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Tambah Data</span>
            </button>
          )}
        </div>

        {isSearch && (
          <input
            type="text"
            placeholder="Cari data..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 px-4 py-2 rounded-lg w-full md:max-w-xs text-sm focus:ring-blue-900 focus:border-blue-900 transition duration-150 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent appearance-none"
          />
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-inner">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900 text-gray-100 uppercase tracking-wide text-xs border-b border-gray-200">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`p-3 font-semibold text-center whitespace-nowrap ${
                    col.sortable
                      ? "cursor-pointer select-none hover:bg-blue-900 transition"
                      : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <div className="flex items-center justify-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <FontAwesomeIcon
                        icon={
                          orderBy === col.accessor
                            ? orderDir === "ASC"
                              ? faSortUp
                              : faSortDown
                            : faSort
                        }
                        className={`text-xs ${
                          orderBy === col.accessor
                            ? "text-gray-100"
                            : "text-gray-200"
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-8 text-blue-600 bg-gray-50"
                >
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="mr-2 text-xl"
                  />
                  Memuat data...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50/50 transition duration-100 text-center"
                >
                  {columns.map((col, j) => (
                    <td key={j} className="p-3 text-gray-700 align-middle">
                      {col.render
                        ? col.render(row, i)
                        : row[col.accessor] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-8 text-gray-500 italic bg-gray-50"
                >
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-5 text-sm gap-3">
        <span className="text-gray-600 order-2 md:order-1">
          {totalDataCount > 0
            ? `Menampilkan ${currentDataStart} - ${currentDataEnd} dari ${totalDataCount} data`
            : "Tidak ada data ditemukan"}
        </span>

        <div className="flex items-center space-x-2 order-1 md:order-2">
          <button
            disabled={page === 1 || totalPages === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            &laquo; Prev
          </button>

          <div className="flex items-center">{renderPageNumbers()}</div>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  );
}
