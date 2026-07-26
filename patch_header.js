const fs = require('fs');

let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf-8');

// Replace onExportCSV with onExport: (type: 'csv' | 'pdf' | 'image') => void;
headerCode = headerCode.replace(/onExportCSV: \(\) => void;/g, "onExport: (type: 'csv' | 'pdf' | 'image') => void;");
headerCode = headerCode.replace(/onExportCSV,/g, "onExport,");

// Add useState
if (!headerCode.includes('useState')) {
  headerCode = headerCode.replace(/import React /g, "import React, { useState } ");
} else if (!headerCode.includes('useState,')) {
    headerCode = headerCode.replace(/import React, {/g, "import React, { useState,");
}

// Add state for export dropdown
headerCode = headerCode.replace(/const months = \[/g, "const [isExportOpen, setIsExportOpen] = useState(false);\n  const months = [");

// Replace export button with dropdown
const buttonHtml = `
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-50">
                  <button
                    onClick={() => { onExport('csv'); setIsExportOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => { onExport('pdf'); setIsExportOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => { onExport('image'); setIsExportOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Export Image
                  </button>
                </div>
              )}
            </div>
`;

headerCode = headerCode.replace(/<button[^>]*onClick=\{onExportCSV\}[^>]*>[\s\S]*?<\/button>/, buttonHtml);

fs.writeFileSync('src/components/Header.tsx', headerCode);
