'use client'

import React, { useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CRMClient } from "@/components/crm-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandTwitter, 
  IconBrandTiktok,
  IconMail,
  IconPhone,
  IconBuilding
} from "@tabler/icons-react";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface ExpandableClientViewProps {
  client: CRMClient | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: CRMClient) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Started':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'Idle':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'Closed':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

export function ExpandableClientView({ client, isOpen, onClose, onEdit }: ExpandableClientViewProps) {
  const id = useId();
  const ref = React.useRef<HTMLDivElement>(null);

  useOutsideClick(ref, onClose);

  if (!client) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.div
              ref={ref}
              className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-gray-900 rounded-3xl border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="bg-gray-900/95 border-b border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">{client.channel_name}</h2>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                      <span className="text-gray-400 text-sm">
                        {new Intl.NumberFormat().format(client.subscribers)} subscribers
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => onEdit(client)} className="bg-gray-700 hover:bg-gray-600">
                      Edit Client
                    </Button>
                    <Button onClick={onClose} variant="outline" className="border-gray-600">
                      Close
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Client Information</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                        <IconBuilding size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Name</p>
                          <p className="text-white">{client.client_details.name || 'Not provided'}</p>
                        </div>
                      </div>

                      {client.email && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                          <IconMail size={20} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Email</p>
                            <a href={`mailto:${client.email}`} className="text-blue-400 hover:text-blue-300">
                              {client.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {client.client_details.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                          <IconPhone size={20} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Phone</p>
                            <p className="text-white">{client.client_details.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Social Media</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {client.social_links.youtube && (
                        <a href={client.social_links.youtube} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700">
                          <IconBrandYoutube size={20} className="text-red-400" />
                          <span className="text-sm text-gray-300">YouTube</span>
                        </a>
                      )}
                      {client.social_links.instagram && (
                        <a href={client.social_links.instagram} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700">
                          <IconBrandInstagram size={20} className="text-pink-400" />
                          <span className="text-sm text-gray-300">Instagram</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}