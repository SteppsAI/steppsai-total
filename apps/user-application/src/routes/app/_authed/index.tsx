import { createFileRoute } from "@tanstack/react-router";
import {
  Edit3,
  Share2,
  Trash2
} from "lucide-react";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8 h-full">

      {/* Recents Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-normal text-slate-900">Recent Stepps:</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="flex flex-col gap-2 group cursor-pointer">
            <div className="relative aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-slate-50/50 flex items-center justify-center">
                {/* Consistent Placeholder */}
                <div className="w-3/4 h-3/4 bg-white rounded shadow-sm border border-slate-100 flex flex-col p-2 gap-2">
                  <div className="h-2 w-1/3 bg-slate-100 rounded"></div>
                  <div className="flex-1 bg-slate-50 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-medium text-slate-800 text-base truncate">Searching using Google</h3>
              <div className="flex items-center gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="hover:text-slate-900 transition-colors"><Edit3 className="size-3.5" /></button>
                <button className="hover:text-slate-900 transition-colors"><Share2 className="size-3.5" /></button>
                <button className="hover:text-slate-900 transition-colors"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-2 group cursor-pointer">
            <div className="relative aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-slate-50/50 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-white rounded shadow-sm border border-slate-100 flex flex-col p-2 gap-2">
                  <div className="h-2 w-1/3 bg-slate-100 rounded"></div>
                  <div className="flex-1 bg-slate-50 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-medium text-slate-800 text-base truncate">Setting up Render account</h3>
              <div className="flex items-center gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="hover:text-slate-900 transition-colors"><Edit3 className="size-3.5" /></button>
                <button className="hover:text-slate-900 transition-colors"><Share2 className="size-3.5" /></button>
                <button className="hover:text-slate-900 transition-colors"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-2 group cursor-pointer">
            <div className="relative aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-slate-50/50 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-white rounded shadow-sm border border-slate-100 flex flex-col p-2 gap-2">
                  <div className="h-2 w-1/3 bg-slate-100 rounded"></div>
                  <div className="flex-1 bg-slate-50 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-medium text-slate-800 text-base truncate">How to send email</h3>
              <div className="flex items-center gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="hover:text-slate-900 transition-colors"><Edit3 className="size-3.5" /></button>
                <button className="hover:text-slate-900 transition-colors"><Share2 className="size-3.5" /></button>
                <button className="hover:text-slate-900 transition-colors"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Templates & Embeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Templates */}
        <section className="flex flex-col gap-4 h-full">
          <h2 className="text-2xl font-normal text-slate-900">Templates:</h2>
          <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-center justify-center min-h-[200px]">
            <span className="text-slate-800 font-medium text-lg">coming soon...</span>
          </div>
        </section>

        {/* Embed Stepps */}
        <section className="flex flex-col gap-4 h-full">
          <h2 className="text-2xl font-normal text-slate-900">Embed Stepps:</h2>
          <div className="flex-1 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-center justify-center min-h-[200px]">
            <span className="text-slate-800 font-medium text-lg">coming soon...</span>
          </div>
        </section>
      </div>

    </div>
  );
}
