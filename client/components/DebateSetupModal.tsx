"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

interface DebateSetupModalProps {
  isOpen: boolean
  onClose: () => void
  topic: string
}

export function DebateSetupModal({ isOpen, onClose, topic }: DebateSetupModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-8 text-left align-middle shadow-2xl transition-all border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Start a Debate
                  </Dialog.Title>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                  <h3 className="font-semibold text-pink-800 mb-2">Debate Topic:</h3>
                  <p className="text-pink-700">{topic}</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Ready to see how history's greatest minds would debate this topic?
                  </p>

                  <Link
                    href={`/debate?topic=${encodeURIComponent(topic)}`}
                    onClick={onClose}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <span>Setup Debate</span>
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
