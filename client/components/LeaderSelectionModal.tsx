"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { leaders } from "@/lib/data"

interface LeaderSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  topic: string
}

export function LeaderSelectionModal({ isOpen, onClose, topic }: LeaderSelectionModalProps) {
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-8 text-left align-middle shadow-2xl transition-all border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Select a Leader to Consult
                  </Dialog.Title>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <h3 className="font-semibold text-indigo-800 mb-2">Topic:</h3>
                  <p className="text-indigo-700">{topic}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {leaders.map((leader) => (
                    <Link
                      key={leader.id}
                      href={`/consult?leader=${leader.id}&topic=${encodeURIComponent(topic)}`}
                      onClick={onClose}
                      className="group p-4 bg-white/50 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <Image
                        src={leader.image || "/placeholder.svg"}
                        alt={leader.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white shadow-lg group-hover:scale-110 transition-transform"
                      />
                      <h3 className="font-semibold text-center text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {leader.name}
                      </h3>
                      <p className="text-xs text-gray-600 text-center mt-1">{leader.specialty}</p>
                    </Link>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
