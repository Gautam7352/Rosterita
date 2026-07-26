const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Add Menu, X icons
code = code.replace(/import \{ Calendar,/, "import { Menu, X, Calendar,");

// Add state for mobile menu
code = code.replace(/const \[isExportOpen, setIsExportOpen\] = useState\(false\);/, "const [isExportOpen, setIsExportOpen] = useState(false);\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);");

// Rewrite the navigation section
const navSectionRegex = /\{\/\* Minimal Navigation Tabs \*\/\}[\s\S]*?<\/header>/;

const newNavSection = `{/* Mobile Menu Toggle & Active Tab Display */}
        <div className="md:hidden mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
            {activeTab === 'grid' && <><Calendar className="w-4 h-4" /> Monthly Roster</>}
            {activeTab === 'schedules' && <><UserCheck className="w-4 h-4" /> Engineer Timetables</>}
            {activeTab === 'leave' && <><Palmtree className="w-4 h-4" /> Leave Requests</>}
            {activeTab === 'team' && <><Users className="w-4 h-4" /> Team & Preferences</>}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Tabs (Horizontal on MD+, Stacked on Mobile) */}
        <div className={\`\${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-center gap-1 sm:gap-2 mt-2 md:mt-3 md:pt-2 md:border-t border-slate-100 text-xs font-medium md:overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0\`}>
          <button
            onClick={() => { onTabChange('grid'); setIsMobileMenuOpen(false); }}
            className={\`flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-md transition-colors cursor-pointer shrink-0 \${
              activeTab === 'grid'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }\`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Roster</span>
          </button>

          <button
            onClick={() => { onTabChange('schedules'); setIsMobileMenuOpen(false); }}
            className={\`flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-md transition-colors cursor-pointer shrink-0 \${
              activeTab === 'schedules'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }\`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Engineer Timetables</span>
          </button>

          <button
            onClick={() => { onTabChange('leave'); setIsMobileMenuOpen(false); }}
            className={\`flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-md transition-colors cursor-pointer shrink-0 \${
              activeTab === 'leave'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }\`}
          >
            <Palmtree className="w-3.5 h-3.5" />
            <span>Leave Requests</span>
            {approvedLeaveCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-800 rounded-full">
                {approvedLeaveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { onTabChange('team'); setIsMobileMenuOpen(false); }}
            className={\`flex items-center gap-1.5 px-3 py-2 md:py-1.5 rounded-md transition-colors cursor-pointer shrink-0 \${
              activeTab === 'team'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }\`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team & Preferences</span>
          </button>
        </div>
      </div>
    </header>
  );
};`;

code = code.replace(navSectionRegex, newNavSection);
fs.writeFileSync('src/components/Header.tsx', code);
