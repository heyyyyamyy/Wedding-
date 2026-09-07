/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Table, 
  Download, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  UserX, 
  MessageCircleHeart, 
  RefreshCw, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Heart
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RSVPInfo, BlessingItem } from '../types';

interface DataSheetViewerProps {
  onClose: () => void;
}

export default function DataSheetViewer({ onClose }: DataSheetViewerProps) {
  const [activeTab, setActiveTab] = useState<'rsvps' | 'blessings'>('rsvps');
  const [rsvps, setRsvps] = useState<RSVPInfo[]>([]);
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(true);
  const [loadingBlessings, setLoadingBlessings] = useState(true);

  // Filters & Search
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [blessingSearch, setBlessingSearch] = useState('');

  // Subscribe to RSVPs from Firestore
  useEffect(() => {
    const q = query(collection(db, 'rsvps'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: RSVPInfo[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || '',
          email: doc.data().email || '',
          phone: doc.data().phone || '',
          attending: doc.data().attending || 'unconfirmed',
          guestsCount: Number(doc.data().guestsCount) || 1,
          message: doc.data().message || '',
          submittedAt: doc.data().submittedAt || '',
        }));
        setRsvps(list);
        setLoadingRsvps(false);
      },
      (error) => {
        console.warn('Firestore RSVPs subscription error:', error);
        setLoadingRsvps(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to Blessings from Firestore
  useEffect(() => {
    const q = query(collection(db, 'blessings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: BlessingItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          sender: doc.data().sender || '',
          city: doc.data().city || '',
          message: doc.data().message || '',
          likes: typeof doc.data().likes === 'number' ? doc.data().likes : 0,
          createdAt: doc.data().createdAt || '',
        }));
        setBlessings(list);
        setLoadingBlessings(false);
      },
      (error) => {
        console.warn('Firestore Blessings subscription error:', error);
        setLoadingBlessings(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(rsvpSearch.toLowerCase()) ||
        (item.phone && item.phone.toLowerCase().includes(rsvpSearch.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(rsvpSearch.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(rsvpSearch.toLowerCase()));

      const matchesStatus =
        rsvpStatusFilter === 'all' || item.attending === rsvpStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rsvps, rsvpSearch, rsvpStatusFilter]);

  // Filtered Blessings
  const filteredBlessings = useMemo(() => {
    return blessings.filter((item) => {
      return (
        item.sender.toLowerCase().includes(blessingSearch.toLowerCase()) ||
        (item.city && item.city.toLowerCase().includes(blessingSearch.toLowerCase())) ||
        item.message.toLowerCase().includes(blessingSearch.toLowerCase())
      );
    });
  }, [blessings, blessingSearch]);

  // RSVP Metrics
  const totalRsvps = rsvps.length;
  const attendingCount = rsvps.filter((r) => r.attending === 'yes').length;
  const totalAttendingGuests = rsvps
    .filter((r) => r.attending === 'yes')
    .reduce((sum, r) => sum + (r.guestsCount || 1), 0);
  const declinedCount = rsvps.filter((r) => r.attending === 'no').length;

  // Total Likes/Ameens
  const totalLikes = blessings.reduce((sum, b) => sum + (b.likes || 0), 0);

  // CSV Exporter
  const exportToCsv = () => {
    if (activeTab === 'rsvps') {
      const headers = ['Row', 'Timestamp', 'Guest Name', 'Attending', 'Guests Count', 'Phone', 'Email', 'Message'];
      const rows = filteredRsvps.map((r, idx) => [
        idx + 1,
        r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '',
        `"${(r.name || '').replace(/"/g, '""')}"`,
        r.attending === 'yes' ? 'Attending' : 'Declined',
        r.attending === 'yes' ? r.guestsCount : 0,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.message || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      downloadFile(csvContent, 'Saima-Sohail-Wedding-RSVP-Sheet.csv');
    } else {
      const headers = ['Row', 'Timestamp', 'Sender Name', 'City/Relation', 'Prayer & Dua Message', 'Ameen / Hearts'];
      const rows = filteredBlessings.map((b, idx) => [
        idx + 1,
        b.createdAt ? new Date(b.createdAt).toLocaleString() : '',
        `"${(b.sender || '').replace(/"/g, '""')}"`,
        `"${(b.city || '').replace(/"/g, '""')}"`,
        `"${(b.message || '').replace(/"/g, '""')}"`,
        b.likes || 0,
      ]);

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      downloadFile(csvContent, 'Saima-Sohail-Wedding-Blessings-Sheet.csv');
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl border border-gold-200/80 flex flex-col h-full max-w-7xl w-full mx-auto overflow-hidden"
      >
        {/* Top App Bar */}
        <div className="bg-emerald-950 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gold-400/20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider"
              title="Return to wedding invitation"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invitation</span>
            </button>
            <div className="h-6 w-[1px] bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-gold-400" />
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-gold-100 tracking-wide">
                  Saima & Sohail — Live Guest Sheets
                </h2>
                <p className="text-[10px] text-emerald-200/70 font-mono">
                  Real-time Firebase Firestore database synchronization
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-emerald-950 text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Selector & Metrics Strip */}
        <div className="bg-emerald-900/5 px-5 py-3 border-b border-gold-200/50 flex flex-wrap items-center justify-between gap-3">
          {/* Sheet Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rsvps')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'rsvps'
                  ? 'bg-emerald-900 text-gold-200 shadow-sm'
                  : 'bg-white text-emerald-950/70 hover:bg-gold-50 border border-gold-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>RSVPs Sheet</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-gold-400/20 text-gold-300">
                {rsvps.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('blessings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'blessings'
                  ? 'bg-emerald-900 text-gold-200 shadow-sm'
                  : 'bg-white text-emerald-950/70 hover:bg-gold-50 border border-gold-200/60'
              }`}
            >
              <MessageCircleHeart className="w-3.5 h-3.5" />
              <span>Blessings & Duas Sheet</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-gold-400/20 text-gold-300">
                {blessings.length}
              </span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          {activeTab === 'rsvps' ? (
            <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{attendingCount}</span> Attending ({totalAttendingGuests} pax)
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-semibold">{declinedCount}</span> Declined
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gold-50 border border-gold-200 text-gold-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gold-600" />
                <span className="font-semibold">{totalRsvps}</span> Total Responses
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
              <div className="px-3 py-1.5 rounded-lg bg-gold-50 border border-gold-200 text-gold-900 flex items-center gap-1.5">
                <MessageCircleHeart className="w-3.5 h-3.5 text-gold-600" />
                <span className="font-semibold">{blessings.length}</span> Duas Shared
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30" />
                <span className="font-semibold">{totalLikes}</span> Ameen Reactions
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'rsvps' ? 'Search by name, phone, email, notes...' : 'Search prayers, sender, city...'}
              value={activeTab === 'rsvps' ? rsvpSearch : blessingSearch}
              onChange={(e) =>
                activeTab === 'rsvps' ? setRsvpSearch(e.target.value) : setBlessingSearch(e.target.value)
              }
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>

          {activeTab === 'rsvps' && (
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500 font-sans">Status:</span>
              <button
                onClick={() => setRsvpStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  rsvpStatusFilter === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({rsvps.length})
              </button>
              <button
                onClick={() => setRsvpStatusFilter('yes')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  rsvpStatusFilter === 'yes'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Attending ({attendingCount})
              </button>
              <button
                onClick={() => setRsvpStatusFilter('no')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  rsvpStatusFilter === 'no'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Declined ({declinedCount})
              </button>
            </div>
          )}
        </div>

        {/* Sheet Table View */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          {activeTab === 'rsvps' ? (
            loadingRsvps ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-emerald-950/60">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-serif">Connecting to Firestore RSVPs...</span>
              </div>
            ) : filteredRsvps.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="font-serif text-base font-semibold text-gray-700">No RSVP submissions found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {rsvpSearch ? 'Try clearing your search keywords.' : 'RSVP responses submitted through the website will appear here in real-time.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-gray-100/95 backdrop-blur-xs text-emerald-950 font-sans font-bold uppercase tracking-wider text-[10px] border-b border-gray-200 z-10">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center text-gray-400">#</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Party Size</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Note / Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-sans">
                  {filteredRsvps.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-gold-50/30 transition-colors">
                      <td className="py-3 px-4 text-center text-gray-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(row.submittedAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-950 whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {row.attending === 'yes' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Attending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-950 font-mono">
                        {row.attending === 'yes' ? row.guestsCount : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700 whitespace-nowrap">
                        {row.phone || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {row.email || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600 italic max-w-xs truncate" title={row.message}>
                        {row.message ? `"${row.message}"` : <span className="text-gray-300 not-italic">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            loadingBlessings ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-emerald-950/60">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-serif">Connecting to Firestore Blessings...</span>
              </div>
            ) : filteredBlessings.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <MessageCircleHeart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="font-serif text-base font-semibold text-gray-700">No blessings or Duas yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  The blessings wall is currently clean and blank. When guests submit Duas, they will be catalogued in this sheet.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-gray-100/95 backdrop-blur-xs text-emerald-950 font-sans font-bold uppercase tracking-wider text-[10px] border-b border-gray-200 z-10">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center text-gray-400">#</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">City / Relation</th>
                    <th className="py-3 px-4">Dua & Prayer Message</th>
                    <th className="py-3 px-4 text-center">Ameens / Hearts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-sans">
                  {filteredBlessings.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-gold-50/30 transition-colors">
                      <td className="py-3 px-4 text-center text-gray-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-950 whitespace-nowrap">
                        {row.sender}
                      </td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {row.city || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-serif italic max-w-md">
                        "{row.message}"
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          {row.likes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

        {/* Footer info strip */}
        <div className="bg-white border-t border-gray-200 px-5 py-2.5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
          <span>
            Displaying {activeTab === 'rsvps' ? filteredRsvps.length : filteredBlessings.length} records • Live cloud database
          </span>
          <span className="text-gold-700 font-semibold">
            Startup solution
          </span>
        </div>
      </motion.div>
    </div>
  );
}
