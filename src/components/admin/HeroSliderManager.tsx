import React, { useState, useEffect } from 'react';
import { HeroSlide } from '../../types';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Link as LinkIcon,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { AdminModal, ConfirmDialog } from './common/modal';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { SafeLink } from '../common/SafeLink';
import { apiRequest } from '../../services/api';
import { useAppDispatch } from '../../app/hooks';
import { addToast } from '../../features/ui/uiSlice';

interface HeroSliderManagerProps {
  slides?: HeroSlide[];
  onRefresh: () => void;
}

export const HeroSliderManager: React.FC<HeroSliderManagerProps> = ({ onRefresh }) => {
  const dispatch = useAppDispatch();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // ConfirmDialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    isConfirming: boolean;
  }>({
    isOpen: false,
    id: '',
    title: '',
    isConfirming: false,
  });

  const [form, setForm] = useState({
    title: '',
    desktopImage: '',
    mobileImage: '',
    destinationUrl: '',
    target: '_self' as '_self' | '_blank',
    order: 1,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const fetchSlides = async () => {
    setIsLoading(true);
    const res = await apiRequest('/hero-slides');
    setIsLoading(false);
    if (res.success && res.slides) {
      setSlides(res.slides);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenCreate = () => {
    setEditingSlide(null);
    setForm({
      title: `Hero Slide #${slides.length + 1}`,
      desktopImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1600&q=85',
      mobileImage: '',
      destinationUrl: '/shop',
      target: '_self',
      order: slides.length + 1,
      isActive: true,
      startDate: '',
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      desktopImage: slide.desktopImage,
      mobileImage: slide.mobileImage || '',
      destinationUrl: slide.destinationUrl || '',
      target: slide.target || '_self',
      order: slide.order,
      isActive: slide.isActive !== false,
      startDate: slide.startDate ? new Date(slide.startDate).toISOString().slice(0, 10) : '',
      endDate: slide.endDate ? new Date(slide.endDate).toISOString().slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desktopImage) {
      dispatch(addToast({ type: 'error', title: 'Image Required', message: 'Please upload or provide a desktop slide image.' }));
      return;
    }

    let res;
    if (editingSlide) {
      res = await apiRequest(`/hero-slides/${editingSlide._id || editingSlide.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
    } else {
      res = await apiRequest('/hero-slides', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    }

    if (res.success) {
      setIsModalOpen(false);
      fetchSlides();
      onRefresh();
      dispatch(
        addToast({
          type: 'success',
          title: editingSlide ? 'Hero Slide Updated' : 'Hero Slide Created',
          message: 'Changes are live in the Image-Only hero slider on the storefront.',
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Operation Failed',
          message: res.message || 'Could not save slide.',
        })
      );
    }
  };

  const handleDeleteSlide = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      id,
      title,
      isConfirming: false,
    });
  };

  const handleConfirmDeleteSlide = async () => {
    setDeleteDialog((prev) => ({ ...prev, isConfirming: true }));
    try {
      const res = await apiRequest(`/hero-slides/${deleteDialog.id}`, { method: 'DELETE' });
      if (res.success) {
        fetchSlides();
        onRefresh();
        dispatch(addToast({ type: 'info', title: 'Slide Removed', message: `"${deleteDialog.title}" was removed.` }));
        setDeleteDialog((prev) => ({ ...prev, isOpen: false, isConfirming: false }));
      } else {
        dispatch(addToast({ type: 'error', title: 'Delete Failed', message: res.message || 'Could not delete slide.' }));
        setDeleteDialog((prev) => ({ ...prev, isConfirming: false }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', title: 'Error', message: err.message }));
      setDeleteDialog((prev) => ({ ...prev, isConfirming: false }));
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    const res = await apiRequest(`/hero-slides/${slide._id || slide.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !slide.isActive }),
    });
    if (res.success) {
      fetchSlides();
      onRefresh();
      dispatch(
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Slide is now ${!slide.isActive ? 'active' : 'inactive'} on the homepage.`,
        })
      );
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Recalculate orders
    const items = newSlides.map((s, idx) => ({ id: s._id || s.id, order: idx + 1 }));
    setSlides(newSlides);

    await apiRequest('/hero-slides/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });

    fetchSlides();
    onRefresh();
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Hero Image Slider (Image-Only)</h2>
            <p className="text-xs text-slate-500">
              Manage image-only carousel slides. Each slide optionally links to a destination URL with zero text overlays.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Image-Only Policy Active:</strong> Hero slides render pure visual assets. If a URL is configured, the slide image is clickable. No text overlays or badges are displayed.
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200">
          {slides.length} Slides Total
        </span>
      </div>

      {/* Slide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slides.map((slide, index) => (
          <div
            key={slide._id || slide.id || index}
            className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
              slide.isActive
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            {/* Visual Preview */}
            <div className="relative aspect-21/9 sm:aspect-24/9 bg-slate-900 overflow-hidden group">
              <img
                src={slide.desktopImage}
                alt={slide.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2.5 left-2.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                #{slide.order}
              </span>
              <span
                className={`absolute top-2.5 right-2.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  slide.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-slate-100'
                }`}
              >
                {slide.isActive ? 'Active' : 'Disabled'}
              </span>

              {slide.destinationUrl && (
                <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-[10px] bg-black/60 text-blue-200 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  <LinkIcon className="w-3 h-3" />
                  <span className="truncate max-w-[160px] font-mono">{slide.destinationUrl}</span>
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{slide.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>Target: <strong className="text-slate-700">{slide.target || '_self'}</strong></span>
                  {slide.mobileImage && <span className="text-blue-600 font-semibold">• Mobile asset set</span>}
                </div>
              </div>

              {/* Bottom Action Controls */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move slide earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                    title="Move slide later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title={slide.isActive ? 'Hide slide' : 'Activate slide'}
                  >
                    {slide.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(slide)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Edit slide"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide._id || slide.id || '', slide.title)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AdminModal for Creating / Editing Slide */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<Sliders className="w-5 h-5" />}
        title={editingSlide ? 'Edit Image-Only Hero Slide' : 'Create Image-Only Hero Slide'}
        subtitle="Manage hero carousel visual creative, display ordering, and optional clickable destination."
        size="2xl"
      >
        <form onSubmit={handleSaveSlide} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Internal Slide Reference Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Galaxy S25 Ultra AI Flagship Launch"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Used strictly for internal administrative identification. It will never appear on the storefront.
            </p>
          </div>

          {/* Desktop Image Upload */}
          <ImageUploadInput
            label="Desktop Hero Image"
            required
            value={form.desktopImage}
            onChange={(url) => setForm({ ...form, desktopImage: url })}
            placeholder="https://images.unsplash.com/..."
            helperText="High-resolution banner graphic (1600x600 recommended). Upload from device or enter URL."
          />

          {/* Mobile Image Upload */}
          <ImageUploadInput
            label="Optional Mobile Slide Image"
            value={form.mobileImage}
            onChange={(url) => setForm({ ...form, mobileImage: url })}
            placeholder="https://..."
            helperText="Optional vertical or compact crop optimized for mobile devices (800x600)."
          />

          {/* Optional Destination Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Optional Destination URL
              </label>
              <input
                type="text"
                value={form.destinationUrl}
                onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
                placeholder="/product/samsung-galaxy-s25-ultra or https://..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400">
                If provided, clicking anywhere on the image navigates to this URL. If empty, the image is non-clickable.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Link Target</label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="_self">Same Tab (_self)</option>
                <option value="_blank">New Tab (_blank)</option>
              </select>
            </div>
          </div>

          {/* Date Scheduling & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Display Order</label>
              <input
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Start Date (Optional)</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">End Date (Optional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Slide is Active and visible to public</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                {editingSlide ? 'Save Changes' : 'Create Slide'}
              </button>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeleteSlide}
        title="Delete Hero Slide"
        recordIdentifier={deleteDialog.title}
        message="Are you sure you want to permanently delete this hero slide from the storefront carousel? This action cannot be undone."
        isConfirming={deleteDialog.isConfirming}
        confirmLabel="Delete Slide"
        variant="danger"
      />
    </div>
  );
};
