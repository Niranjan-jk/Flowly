'use client'

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MagicCard } from "@/components/magicui/magic-card";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { useOutsideClick } from "@/hooks/use-outside-click";
import NavigationDock from '@/components/navigation-dock';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import ModernTemplateForm from '@/components/modern-template-form';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Email template data
const emailTemplates = [
  {
    id: "welcome",
    title: "Welcome Email",
    description: "Onboard new users with a warm welcome",
    category: "Onboarding",
    preview: "Welcome to our platform! We're excited to have you...",
    content: () => (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Welcome Email Template</h4>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-300 text-sm">Subject: Welcome to [Company Name]!</p>
          <div className="mt-3 space-y-2 text-gray-400 text-sm">
            <p>Hi [Name],</p>
            <p>Welcome to [Company Name]! We're thrilled to have you as part of our community.</p>
            <p>Here's what you can do next:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Complete your profile setup</li>
              <li>Explore our features</li>
              <li>Connect with our support team</li>
            </ul>
            <p>If you have any questions, don't hesitate to reach out!</p>
            <p>Best regards,<br/>The [Company Name] Team</p>
          </div>
        </div>
      </div>
    ),
    src: "/api/placeholder/300/200"
  },
  {
    id: "followup",
    title: "Follow-up Email",
    description: "Re-engage prospects with personalized follow-ups",
    category: "Sales",
    preview: "I hope this email finds you well. I wanted to follow up...",
    content: () => (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Follow-up Email Template</h4>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-300 text-sm">Subject: Following up on our conversation</p>
          <div className="mt-3 space-y-2 text-gray-400 text-sm">
            <p>Hi [Name],</p>
            <p>I hope this email finds you well. I wanted to follow up on our conversation about [Topic].</p>
            <p>Based on what we discussed, I believe [Solution] could be a great fit for [Company Name].</p>
            <p>Would you be available for a quick 15-minute call this week to discuss next steps?</p>
            <p>Looking forward to hearing from you.</p>
            <p>Best regards,<br/>[Your Name]</p>
          </div>
        </div>
      </div>
    ),
    src: "/api/placeholder/300/200"
  },
  {
    id: "newsletter",
    title: "Newsletter Template",
    description: "Keep your audience engaged with regular updates",
    category: "Marketing",
    preview: "This month's highlights and upcoming events...",
    content: () => (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Newsletter Template</h4>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-300 text-sm">Subject: [Month] Newsletter - What's New at [Company Name]</p>
          <div className="mt-3 space-y-2 text-gray-400 text-sm">
            <p>Hi [Name],</p>
            <p>Here's what's been happening at [Company Name] this month:</p>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-300">🚀 New Features</h5>
              <p>[Feature 1 description]</p>
              <p>[Feature 2 description]</p>
              
              <h5 className="font-semibold text-gray-300">📅 Upcoming Events</h5>
              <p>[Event 1] - [Date]</p>
              <p>[Event 2] - [Date]</p>
              
              <h5 className="font-semibold text-gray-300">💡 Tips & Tricks</h5>
              <p>[Helpful tip for users]</p>
            </div>
            <p>Thank you for being part of our community!</p>
            <p>Best regards,<br/>The [Company Name] Team</p>
          </div>
        </div>
      </div>
    ),
    src: "/api/placeholder/300/200"
  },
  {
    id: "proposal",
    title: "Proposal Email",
    description: "Present your solutions professionally",
    category: "Sales",
    preview: "Thank you for considering us for your project...",
    content: () => (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Proposal Email Template</h4>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-300 text-sm">Subject: Proposal for [Project Name]</p>
          <div className="mt-3 space-y-2 text-gray-400 text-sm">
            <p>Dear [Name],</p>
            <p>Thank you for considering [Company Name] for your [Project Type] project.</p>
            <p>Based on our discussions, I've prepared a detailed proposal that outlines:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Project scope and deliverables</li>
              <li>Timeline and milestones</li>
              <li>Investment required</li>
              <li>Our team and approach</li>
            </ul>
            <p>Please find the attached proposal document for your review.</p>
            <p>I'm available to discuss any questions or modifications you might have.</p>
            <p>Best regards,<br/>[Your Name]</p>
          </div>
        </div>
      </div>
    ),
    src: "/api/placeholder/300/200"
  }
];

export default function EmailTemplatesPage() {
  const [active, setActive] = useState<(typeof emailTemplates)[number] | boolean | null>(null);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  const handleSaveTemplate = async (templateData: any) => {
    // Here you would typically save to your backend/database
    console.log('Saving template:', templateData);
    // For now, just close the dialog
    setShowAddTemplate(false);
    // You could also add the template to local state and refresh the list
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => setActive(null));

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                Email Templates
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Choose from professional email templates or create your own
              </p>
            </div>
            <RainbowButton onClick={() => setShowAddTemplate(true)}>
              Add Template
            </RainbowButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Expandable Modal Overlay */}
        <AnimatePresence>
          {active && typeof active === "object" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 h-full w-full z-50"
            />
          )}
        </AnimatePresence>
        
        {/* Expandable Modal */}
        <AnimatePresence>
          {active && typeof active === "object" ? (
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.button
                key={`button-${active.title}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                onClick={() => setActive(null)}
              >
                <CloseIcon />
              </motion.button>
              <motion.div
                layoutId={`card-${active.title}-${id}`}
                ref={ref}
                className="w-full max-w-[600px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-gray-800 sm:rounded-3xl overflow-hidden border border-gray-700"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <motion.h3
                        layoutId={`title-${active.title}-${id}`}
                        className="font-medium text-white text-xl"
                      >
                        {active.title}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${active.description}-${id}`}
                        className="text-gray-400 text-sm mt-1"
                      >
                        {active.description}
                      </motion.p>
                      <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-2">
                        {active.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Use Template
                      </motion.button>
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-2 text-sm rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-600"
                      >
                        Edit
                      </motion.button>
                    </div>
                  </div>
                  <div className="relative">
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-300 text-sm h-fit max-h-[60vh] overflow-auto [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                    >
                      {typeof active.content === "function" ? active.content() : active.content}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {emailTemplates.map((template) => (
            <motion.div
              key={template.id}
              layoutId={`card-${template.title}-${id}`}
              onClick={() => setActive(template)}
              className="cursor-pointer"
            >
              <MagicCard className="h-full p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${template.title}-${id}`}
                      className="text-lg font-semibold text-white mb-2"
                    >
                      {template.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${template.description}-${id}`}
                      className="text-gray-400 text-sm mb-3"
                    >
                      {template.description}
                    </motion.p>
                    <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mb-3">
                      {template.category}
                    </span>
                    <p className="text-gray-500 text-xs italic">
                      "{template.preview}"
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Click to preview</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Dock */}
      <NavigationDock />

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
          <ModernTemplateForm 
            onSave={handleSaveTemplate}
            onCancel={() => setShowAddTemplate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};