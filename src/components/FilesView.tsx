import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Search, 
  UploadCloud, 
  File, 
  Folder, 
  Database, 
  HardDrive,
  Download,
  Plus,
  Image,
  Archive,
  Wrench
} from 'lucide-react';
import { IMSFile, User } from '../types';

interface FilesViewProps {
  files: IMSFile[];
  onAddFile: (file: Omit<IMSFile, 'id'>) => void;
  onDeleteFile: (id: string) => void;
  searchQuery: string;
  currentUser: User | null;
}

export default function FilesView({
  files,
  onAddFile,
  onDeleteFile,
  searchQuery,
  currentUser
}: FilesViewProps) {
  const [fileSearch, setFileSearch] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'image' | 'report' | 'archive' | 'config'>('all');

  // Filter combining search inputs
  const query = (fileSearch || searchQuery).toLowerCase();
  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(query) || f.uploadedBy.toLowerCase().includes(query);
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate total system storage usage simulation
  const totalFilesCount = files.length;
  const storageUsedMB = files.reduce((sum, f) => {
    const sizeNum = parseFloat(f.size);
    if (f.size.includes('GB')) return sum + (sizeNum * 1024);
    return sum + sizeNum;
  }, 0).toFixed(1);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const sizeMB = (droppedFile.size / (1024 * 1024)).toFixed(1);
      
      // Map extension to category
      const name = droppedFile.name;
      let category: IMSFile['category'] = 'report';
      if (/\.(jpg|jpeg|png|gif|svg|fig)$/i.test(name)) category = 'image';
      else if (/\.(zip|tar|gz|rar)$/i.test(name)) category = 'archive';
      else if (/\.(json|config|yaml|ini)$/i.test(name)) category = 'config';

      onAddFile({
        name,
        size: `${sizeMB} MB`,
        type: droppedFile.type || 'System File',
        uploadedBy: 'Admin',
        uploadedAt: 'Today',
        category
      });
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const sizeMB = (selected.size / (1024 * 1024)).toFixed(1);
      const name = selected.name;
      
      let category: IMSFile['category'] = 'report';
      if (/\.(jpg|jpeg|png|gif|svg|fig)$/i.test(name)) category = 'image';
      else if (/\.(zip|tar|gz|rar)$/i.test(name)) category = 'archive';
      else if (/\.(json|config|yaml|ini)$/i.test(name)) category = 'config';

      onAddFile({
        name,
        size: `${sizeMB} MB`,
        type: selected.type || 'System File',
        uploadedBy: 'Admin',
        uploadedAt: 'Today',
        category
      });
    }
  };

  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'report':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-red-500" />;
      case 'config':
        return <Wrench className="w-5 h-5 text-emerald-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'image', label: 'Media & CADs' },
    { id: 'report', label: 'Ledgers' },
    { id: 'archive', label: 'Backups' },
    { id: 'config', label: 'Config' },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in pb-12 font-sans select-none">
      
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Asset Files Vault</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Browse, search, and manage secure enterprise cloud inventory media files.</p>
        </div>
      </section>

      {/* STORAGE OVERVIEW HEADER BOX */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <HardDrive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{storageUsedMB} MB Used</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Documents</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{totalFilesCount} Assets</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync State</p>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">✓ Local Cache Sync OK</p>
          </div>
        </div>
      </section>

      {/* EXPLORER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FILE EXPLORER LISTING (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assets Directory</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 select-text">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Filter by filename..."
                  className="w-full sm:w-44 pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 text-[10px] font-bold">
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id as any)}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      selectedCategory === c.id 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase select-none">
                  <th className="py-2.5 px-6">File Name</th>
                  <th className="py-2.5 px-6">Size</th>
                  <th className="py-2.5 px-6">Uploaded By</th>
                  <th className="py-2.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        {getFileIcon(file.category)}
                        <span className="truncate max-w-[200px] sm:max-w-[320px]">{file.name}</span>
                      </td>
                      <td className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400">{file.size}</td>
                      <td className="py-3 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">{file.uploadedBy}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="inline-flex items-center gap-2.5">
                          <button
                            onClick={() => alert(`Simulating file download: Retrieving ${file.name} (${file.size}) secure server mirror.`)}
                            className="p-1 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                            title="Download Asset"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {currentUser?.role !== 'Team Member' && (
                            <button
                              onClick={() => onDeleteFile(file.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400 dark:text-slate-600">
                      <HardDrive className="w-12 h-12 stroke-1 mx-auto mb-2" />
                      <p className="text-sm font-bold">No assets found</p>
                      <p className="text-xs mt-1">Upload files using the uploader panel or refine your search keywords.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DRAG-AND-DROP UPLOADER PANEL */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Asset Uploader</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Drag-and-drop CAD drawings, product specification grids, or audit reports.</p>
          </div>

          {/* Interactive Drag Stage */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-200 cursor-pointer h-64 ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/5' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <UploadCloud className={`w-12 h-12 mb-3 transition-transform ${dragActive ? 'scale-110 text-blue-500' : 'text-slate-400'}`} />
            
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Drag-and-drop file here or
            </p>
            
            {/* Manual upload input trigger button */}
            <label className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              Browse Local files
              <input
                type="file"
                className="hidden"
                onChange={handleManualUpload}
              />
            </label>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-3">Supports JPG, PNG, PDF, FIG, ZIP up to 500MB</p>
          </div>

          {/* Upload disclaimer guidelines */}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
            ● Files uploaded are parsed on-the-fly and buffered within local application sandbox storage, allowing offline browsing and review on any mobile device.
          </div>
        </div>

      </div>

    </div>
  );
}
