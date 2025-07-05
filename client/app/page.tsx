import Link from "next/link"
import { ArrowRightIcon, GlobeAltIcon, PhotoIcon } from "@heroicons/react/24/outline"

export default function Home() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Dateline */}
        <div className="dateline text-center">{currentDate} — Special Edition</div>

        {/* Main Headline */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl newspaper-headline mb-6 leading-tight">
            HISTORIC SUMMIT CONVENES
          </h1>
          <h2 className="text-2xl md:text-3xl newspaper-subhead mb-8 italic">
            World's Greatest Minds Gather to Address Modern Challenges
          </h2>

          <div className="newspaper-divider"></div>
        </div>

        {/* Lead Article */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="newspaper-article">
              <div className="newspaper-card-content">
                <p className="drop-cap newspaper-body text-lg leading-relaxed mb-6">
                  In an unprecedented gathering of historical proportions, the World Leaders' Roundtable has assembled
                  the most influential minds from across the centuries to address the pressing challenges of our modern
                  era. From the halls of ancient philosophy to the corridors of contemporary power, these luminaries
                  bring wisdom forged through triumph and adversity.
                </p>

                <p className="newspaper-body text-lg leading-relaxed mb-6">
                  Citizens may now engage directly with these distinguished figures, seeking counsel on matters ranging
                  from climate action to technological ethics. Each consultation represents a unique opportunity to
                  bridge the gap between historical wisdom and contemporary challenges.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href="/events" className="newspaper-btn-primary flex items-center justify-center space-x-3">
                    <GlobeAltIcon className="h-5 w-5" />
                    <span>Read Current Affairs</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>

                  <Link href="/gallery" className="newspaper-btn-secondary flex items-center justify-center space-x-3">
                    <PhotoIcon className="h-5 w-5" />
                    <span>View Archives</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Classified Sidebar */}
          <div className="lg:col-span-1">
            <div className="classified-sidebar">
              <h3 className="newspaper-subhead text-lg mb-4 text-center border-b border-gray-400 pb-2">
                CLASSIFIED NOTICES
              </h3>

              <div className="space-y-4 text-sm">
                <div className="border-b border-gray-300 pb-2">
                  <strong>CONSULTATION AVAILABLE:</strong> Seek wisdom from Mahatma Gandhi on matters of non-violent
                  resistance and social justice.
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <strong>DEBATE TONIGHT:</strong> Churchill vs. Roosevelt on economic recovery strategies. Public
                  viewing in the Debate Arena.
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <strong>SPECIAL COLLECTION:</strong> Rare NFTs featuring Lincoln's thoughts on democracy now available
                  in Archives.
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <strong>SOCIETY NOTICE:</strong> Top contributors to public discourse recognized in Society Pages.
                  Join the intellectual elite.
                </div>

                <div className="text-center mt-6 pt-4 border-t border-gray-400">
                  <div className="newspaper-caption">"Where History Meets Tomorrow"</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="newspaper-divider"></div>

        <div className="text-center">
          <h3 className="newspaper-subhead text-xl mb-4">LATEST EDITIONS AVAILABLE</h3>
          <p className="newspaper-body text-lg">
            Connect your digital wallet to access exclusive consultations and preserve historic debates for posterity.
          </p>
        </div>
      </div>
    </div>
  )
}
