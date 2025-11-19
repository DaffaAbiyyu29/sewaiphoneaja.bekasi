"use client";

import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// Wrapper modal reusable
export default function ModalWrapper({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-90"
          >
            <DialogPanel
              className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl p-6 relative border border-gray-100`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="text-gray-600 hover:text-gray-900"
                  />
                </button>
              </div>

              <div className="my-4 border-t border-gray-300"></div>

              {/* Content */}
              {children}
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
