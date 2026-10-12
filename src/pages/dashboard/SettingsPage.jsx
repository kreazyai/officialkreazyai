import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Building2, ShieldCheck, FileText, Users, Lock,
  Bell, CreditCard, Key, AlertTriangle, Camera, Upload,
  Check, X, Eye, EyeOff, Copy, Trash2, Plus, RefreshCw,
  ExternalLink, ChevronRight, Info, CheckCircle2, Clock,
  AlertCircle, Save, Loader2, Smartphone, Globe, Mail, Phone, LogOut
} from 'lucide-react';
import { settingsService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// INLINE TOAST
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)', color: '#16a34a', icon: <CheckCircle2 size={16} /> },
    error: { bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', color: '#dc2626', icon: <AlertCircle size={16} /> },
    info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', color: '#3b82f6', icon: <Info size={16} /> },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: 'var(--bg-card)', border: `1px solid ${c.border}`,
      borderLeft: `4px solid ${c.color}`, borderRadius: '10px',
      padding: '0.85rem 1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      minWidth: '280px', maxWidth: '400px', animation: 'slideInRight 0.3s ease',
    }}>
      <span style={{ color: c.color, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flexGrow: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER — consistent card layout for each settings section
// ─────────────────────────────────────────────────────────────────────────────
function SettingsSection({ title, description, children, footer }) {
  return (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
        {description && <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <div className="settings-section-body">{children}</div>
      {footer && (
        <div className="settings-section-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD — label + input + helper + error
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {required && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', readOnly, disabled, error, suffix, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className="form-input"
        style={{
          width: '100%', boxSizing: 'border-box',
          borderColor: error ? '#dc2626' : undefined,
          paddingRight: suffix ? '3rem' : undefined,
          background: readOnly ? 'var(--bg-subtle)' : undefined,
        }}
        {...props}
      />
      {suffix && (
        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

function SelectInput({ value, onChange, options, disabled }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }}>
      <option value="">Select...</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR UPLOADER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AvatarUploaderModal({ currentUrl, onSave, onRemove, onClose }) {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024;

  const handleFileSelect = (file) => {
    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are accepted.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirm = async () => {
    if (!selectedFile && !preview) return;
    setUploading(true);
    setError('');
    try {
      if (selectedFile) {
        const result = await settingsService.uploadAvatar(selectedFile);
        onSave(result?.avatarUrl || preview);
      } else if (preview) {
        onSave(preview);
      }
    } catch (err) {
      if (preview) {
        onSave(preview);
      } else {
        setError(err.message || 'Unable to upload profile photo.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '480px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            <Camera size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Change Profile Photo
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !preview && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${preview ? 'var(--border-light)' : 'var(--border-medium)'}`,
              borderRadius: '12px', padding: '2rem', textAlign: 'center',
              cursor: preview ? 'default' : 'pointer',
              background: preview ? 'transparent' : 'var(--bg-subtle)',
              transition: 'all 0.2s',
            }}
          >
            {preview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-medium)' }}
                />
                <button
                  onClick={() => { setPreview(null); setSelectedFile(null); }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Choose a different photo
                </button>
              </div>
            ) : (
              <div>
                <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.875rem' }}>Drop your photo here</p>
                <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>or click to browse your device</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP • Max 5 MB</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {error && (
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={13} /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
          {currentUrl && (
            <button
              onClick={onRemove}
              style={{ background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Trash2 size={13} /> Remove Photo
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button onClick={onClose} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={!preview ? () => fileInputRef.current?.click() : handleConfirm}
              disabled={uploading}
              style={{
                background: 'var(--primary, #087A4A)',
                color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.55rem 1.35rem',
                fontSize: '0.82rem', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.45rem', opacity: uploading ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(8, 122, 74, 0.25)', transition: 'all 0.2s ease',
              }}
            >
              {uploading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</> : preview ? <><Check size={14} /> Save Photo</> : <><Upload size={14} /> Choose Photo</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT UPLOADER
// ─────────────────────────────────────────────────────────────────────────────
function DocumentUploader({ docType, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const MAX_SIZE = 10 * 1024 * 1024;

  const handleFile = async (file) => {
    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Only JPG, PNG, WebP, and PDF files are accepted.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File must be smaller than 10 MB.');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const doc = await settingsService.uploadDocument(file, docType, setProgress);
      onUploaded(doc);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--olive-600)' : 'var(--border-medium)'}`,
          borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'rgba(100,120,60,0.05)' : 'var(--bg-subtle)',
          transition: 'all 0.15s',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={24} color="var(--olive-700)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uploading… {progress}%</p>
            <div style={{ width: '100%', maxWidth: '200px', height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--olive-700)', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <div>
            <Upload size={22} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ margin: '0 0 4px', fontSize: '0.82rem', fontWeight: 600 }}>Drop file or click to upload</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP, PDF • Max 10 MB</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {error && <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#dc2626' }}><AlertCircle size={12} style={{ verticalAlign: 'middle' }} /> {error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KYC STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function KYCStatusBadge({ status }) {
  const map = {
    NOT_STARTED: { label: 'Not Started', color: 'var(--text-muted)', bg: 'var(--bg-subtle)', border: 'var(--border-light)', icon: <Info size={13} /> },
    IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)', icon: <Clock size={13} /> },
    UNDER_REVIEW: { label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: <Clock size={13} /> },
    VERIFIED: { label: 'Verified', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)', icon: <CheckCircle2 size={13} /> },
    REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', icon: <AlertCircle size={13} /> },
    NEEDS_UPDATE: { label: 'Needs Update', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', icon: <AlertCircle size={13} /> },
  };
  const s = map[status] || map.NOT_STARTED;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: '100px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700,
    }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE SWITCH
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <label
      className="switch"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        width: '44px',
        height: '24px',
        flexShrink: 0
      }}
    >
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
      />
      <span
        className="slider"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '100px',
          backgroundColor: checked ? 'var(--primary, #087A4A)' : 'var(--border-medium, #D9E9E1)',
          border: '1px solid ' + (checked ? 'var(--primary, #087A4A)' : 'var(--border-light, #D9E9E1)'),
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '18px',
            height: '18px',
            left: '2px',
            top: '2px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
          }}
        />
      </span>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE BUTTON with loading state
// ─────────────────────────────────────────────────────────────────────────────
function SaveButton({ saving, saved, onClick, label = 'Save Changes', icon: Icon = Save, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={saving}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: saved ? 'var(--mint, #DDF7E9)' : 'var(--primary, #087A4A)',
        color: saved ? 'var(--primary, #087A4A)' : '#ffffff',
        border: saved ? '1px solid var(--green, #0FA968)' : '1px solid var(--primary, #087A4A)',
        borderRadius: '8px', padding: '0.6rem 1.4rem',
        fontSize: '0.85rem', fontWeight: 700,
        boxShadow: saved ? 'none' : '0 2px 8px rgba(8, 122, 74, 0.25)',
        cursor: saving ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease', opacity: saving ? 0.75 : 1,
      }}
      onMouseEnter={(e) => {
        if (!saved && !saving) e.currentTarget.style.backgroundColor = '#065F3A';
      }}
      onMouseLeave={(e) => {
        if (!saved && !saving) e.currentTarget.style.backgroundColor = 'var(--primary, #087A4A)';
      }}
    >
      {saving ? (
        <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
      ) : saved ? (
        <><Check size={15} /> Saved!</>
      ) : (
        <><Icon size={15} /> {label}</>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ProfileSection({ user, onToast, onLogout }) {
  const { updateUser } = useAuth();
  const directFileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    displayName: user?.displayName || user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    avatarUrl: user?.avatarUrl || user?.picture || null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    settingsService.getProfile().then(data => {
      setForm(f => ({
        ...f,
        name: data.name || f.name || '',
        displayName: data.displayName || f.displayName || '',
        phone: data.phone || f.phone || '',
        dateOfBirth: data.dateOfBirth || f.dateOfBirth || '',
        gender: data.gender || f.gender || '',
        avatarUrl: data.avatarUrl || f.avatarUrl || null,
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (form.phone && !/^\+?[\d\s\-().]{7,20}$/.test(form.phone)) e.phone = 'Enter a valid phone number with country code.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await settingsService.updateProfile(form);
      if (updateUser) {
        updateUser({
          name: form.name,
          displayName: form.displayName,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          avatarUrl: form.avatarUrl,
          picture: form.avatarUrl
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onToast('Profile updated and saved successfully.', 'success');
    } catch (err) {
      onToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSave = async (url) => {
    setForm(f => ({ ...f, avatarUrl: url }));
    if (updateUser) {
      updateUser({ avatarUrl: url, picture: url });
    }
    try {
      await settingsService.updateProfile({ ...form, avatarUrl: url });
    } catch {
      // already locally persisted
    }
    setShowAvatarModal(false);
    onToast('Profile picture saved successfully.', 'success');
  };

  const handleAvatarRemove = async () => {
    try {
      await settingsService.removeAvatar();
      setForm(f => ({ ...f, avatarUrl: null }));
      if (updateUser) {
        updateUser({ avatarUrl: null, picture: null });
      }
      setShowAvatarModal(false);
      onToast('Profile picture removed.', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDirectFileSelect = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onToast('Please upload a JPG, PNG, or WebP image.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast('Image must be under 5 MB.', 'error');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        setForm(f => ({ ...f, avatarUrl: base64 }));
        if (updateUser) updateUser({ avatarUrl: base64, picture: base64 });
        onToast('Uploading profile picture…', 'info');
        try {
          const res = await settingsService.uploadAvatar(file);
          const finalUrl = res?.avatarUrl || base64;
          setForm(f => ({ ...f, avatarUrl: finalUrl }));
          if (updateUser) updateUser({ avatarUrl: finalUrl, picture: finalUrl });
          await settingsService.updateProfile({ ...form, avatarUrl: finalUrl });
          onToast('Profile picture saved successfully.', 'success');
        } catch {
          onToast('Profile picture updated and saved locally.', 'success');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      onToast(err.message || 'Failed to select image.', 'error');
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const currentDisplayAvatar = form.avatarUrl || user?.avatarUrl || user?.picture;

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading profile…</div>;

  return (
    <>
      <SettingsSection
        title="Profile Information"
        description="Your personal details visible on your account and team workspace."
        footer={<SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Profile Changes" />}
      >
        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowAvatarModal(true)}
              title="Click to change profile picture"
              style={{
                width: '84px', height: '84px', borderRadius: '50%',
                background: currentDisplayAvatar ? 'transparent' : 'linear-gradient(135deg, var(--primary, #087A4A), var(--primary-dark, #092A20))',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--border-medium, #D9E9E1)', flexShrink: 0,
                boxShadow: '0 4px 14px rgba(8, 122, 74, 0.15)',
                cursor: 'pointer'
              }}
            >
              {currentDisplayAvatar ? (
                <img
                  src={currentDisplayAvatar}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setForm(f => ({ ...f, avatarUrl: null }))}
                />
              ) : (
                <span style={{ color: '#ffffff', fontSize: '1.6rem', fontWeight: 800 }}>
                  {form.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              style={{
                position: 'absolute', bottom: '-2px', right: '-2px', width: '26px', height: '26px',
                borderRadius: '50%', background: 'var(--primary, #087A4A)', border: '2px solid #ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'transform 0.15s ease'
              }}
              title="Change photo"
            >
              <Camera size={13} color="#ffffff" />
            </button>
          </div>

          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {form.name || user?.name || 'Your Name'}
            </p>
            <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {user?.email || 'merchant@kreazy.ai'}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                style={{
                  fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--primary, #087A4A)', background: 'var(--mint-soft, #EFFBF5)',
                  border: '1px solid var(--border-medium, #D9E9E1)', borderRadius: '6px',
                  padding: '5px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Camera size={13} /> Change Photo
              </button>

              {currentDisplayAvatar && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  style={{
                    fontSize: '0.82rem', fontWeight: 600,
                    color: '#dc2626', background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px',
                    padding: '5px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#f87171',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden direct file input for instant selection */}
        <input
          ref={directFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleDirectFileSelect(e.target.files[0])}
        />

        {/* Form grid */}
        <div className="settings-form-grid-2">
          <Field label="Full Name" required error={errors.name}>
            <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" error={errors.name} />
          </Field>
          <Field label="Display Name" hint="How you appear in the workspace UI.">
            <TextInput value={form.displayName} onChange={e => set('displayName', e.target.value)} placeholder="e.g. Sadat" />
          </Field>
          <Field label="Email Address">
            <TextInput value={user?.email || ''} readOnly suffix={<Mail size={14} />} />
          </Field>
          <Field label="Phone Number" error={errors.phone} hint="Include country code. e.g. +1 555 000 0000">
            <TextInput value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" error={errors.phone} suffix={<Phone size={14} />} />
          </Field>
          <Field label="Date of Birth">
            <TextInput type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="Gender">
            <SelectInput value={form.gender} onChange={e => set('gender', e.target.value)} options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'non-binary', label: 'Non-binary' },
              { value: 'prefer-not', label: 'Prefer not to say' },
            ]} />
          </Field>
        </div>

        {/* In-form action bar */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Profile Changes" />
        </div>
      </SettingsSection>

      {showAvatarModal && (
        <AvatarUploaderModal
          currentUrl={currentDisplayAvatar}
          onSave={handleAvatarSave}
          onRemove={handleAvatarRemove}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </>
  );
}

function BusinessSection({ onToast }) {
  const [form, setForm] = useState({
    name: '', legalName: '', businessType: '', businessCategory: '', businessDescription: '',
    website: '', businessEmail: '', businessPhone: '', country: '', state: '', city: '',
    address: '', postalCode: '', baseCurrency: 'USD', timezone: 'UTC',
    registrationNumber: '', taxId: '', tradeLicense: '', vatNumber: '',
    dateOfIncorporation: '', countryOfRegistration: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsService.getBusinessProfile().then(data => {
      setForm(f => ({ ...f, ...data }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateBusinessProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onToast('Business information saved.', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading business information…</div>;

  return (
    <>
      <SettingsSection
        title="General Business Information"
        description="Your workspace display name and primary contact details."
        footer={<SaveButton saving={saving} saved={saved} onClick={handleSave} />}
      >
        <div className="settings-form-grid-2">
          <Field label="Business Name" required hint="Shown on your workspace and AI agent messages.">
            <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Kreazy Flagship Studio" />
          </Field>
          <Field label="Business Type">
            <SelectInput value={form.businessType} onChange={e => set('businessType', e.target.value)} options={[
              { value: 'sole-proprietorship', label: 'Sole Proprietorship' },
              { value: 'partnership', label: 'Partnership' },
              { value: 'private-company', label: 'Private Company (Ltd)' },
              { value: 'public-company', label: 'Public Company' },
              { value: 'other', label: 'Other' },
            ]} />
          </Field>
          <Field label="Business Category">
            <SelectInput value={form.businessCategory} onChange={e => set('businessCategory', e.target.value)} options={[
              { value: 'retail', label: 'Retail & E-Commerce' },
              { value: 'fashion', label: 'Fashion & Apparel' },
              { value: 'food-beverage', label: 'Food & Beverage' },
              { value: 'beauty', label: 'Beauty & Wellness' },
              { value: 'electronics', label: 'Electronics' },
              { value: 'home-decor', label: 'Home & Decor' },
              { value: 'services', label: 'Professional Services' },
              { value: 'other', label: 'Other' },
            ]} />
          </Field>
          <Field label="Business Website">
            <TextInput value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourbusiness.com" suffix={<Globe size={14} />} />
          </Field>
          <Field label="Business Email">
            <TextInput type="email" value={form.businessEmail} onChange={e => set('businessEmail', e.target.value)} placeholder="hello@yourbusiness.com" suffix={<Mail size={14} />} />
          </Field>
          <Field label="Business Phone">
            <TextInput value={form.businessPhone} onChange={e => set('businessPhone', e.target.value)} placeholder="+1 555 000 0000" suffix={<Phone size={14} />} />
          </Field>
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <Field label="Business Description">
            <textarea
              value={form.businessDescription}
              onChange={e => set('businessDescription', e.target.value)}
              placeholder="Briefly describe what your business does..."
              className="form-input"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Business Address"
        footer={<SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Address" />}
      >
        <div className="settings-form-grid-2">
          <Field label="Country">
            <TextInput value={form.country} onChange={e => set('country', e.target.value)} placeholder="United States" />
          </Field>
          <Field label="State / Province">
            <TextInput value={form.state} onChange={e => set('state', e.target.value)} placeholder="New York" />
          </Field>
          <Field label="City">
            <TextInput value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York City" />
          </Field>
          <Field label="Postal Code">
            <TextInput value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="10001" />
          </Field>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Street Address">
              <TextInput value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street, Suite 400" />
            </Field>
          </div>
          <Field label="Base Currency">
            <SelectInput value={form.baseCurrency} onChange={e => set('baseCurrency', e.target.value)} options={[
              { value: 'USD', label: 'USD ($) — US Dollar' },
              { value: 'EUR', label: 'EUR (€) — Euro' },
              { value: 'GBP', label: 'GBP (£) — British Pound' },
              { value: 'CAD', label: 'CAD ($) — Canadian Dollar' },
              { value: 'AUD', label: 'AUD ($) — Australian Dollar' },
              { value: 'BDT', label: 'BDT (৳) — Bangladeshi Taka' },
              { value: 'INR', label: 'INR (₹) — Indian Rupee' },
            ]} />
          </Field>
          <Field label="Time Zone">
            <SelectInput value={form.timezone} onChange={e => set('timezone', e.target.value)} options={[
              { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
              { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
              { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
              { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
              { value: 'Europe/London', label: 'London (GMT/BST)' },
              { value: 'Asia/Dhaka', label: 'Dhaka (BST +6)' },
              { value: 'Asia/Dubai', label: 'Dubai (GST +4)' },
            ]} />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Legal & Registration Information"
        description="Required for business verification and compliance. All fields are optional unless verification is requested."
        footer={<SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Legal Info" />}
      >
        <div className="settings-form-grid-2">
          <Field label="Legal Business Name" hint="Exact name on your business registration.">
            <TextInput value={form.legalName} onChange={e => set('legalName', e.target.value)} placeholder="Your Legal Company Name Ltd." />
          </Field>
          <Field label="Registration Number">
            <TextInput value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} placeholder="e.g. 12345678" />
          </Field>
          <Field label="Tax / TIN Number">
            <TextInput value={form.taxId} onChange={e => set('taxId', e.target.value)} placeholder="e.g. XX-XXXXXXX" />
          </Field>
          <Field label="VAT Number">
            <TextInput value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} placeholder="e.g. GB123456789" />
          </Field>
          <Field label="Trade License Number">
            <TextInput value={form.tradeLicense} onChange={e => set('tradeLicense', e.target.value)} placeholder="e.g. TL-2024-001" />
          </Field>
          <Field label="Date of Incorporation">
            <TextInput type="date" value={form.dateOfIncorporation} onChange={e => set('dateOfIncorporation', e.target.value)} />
          </Field>
          <Field label="Country of Registration">
            <TextInput value={form.countryOfRegistration} onChange={e => set('countryOfRegistration', e.target.value)} placeholder="United States" />
          </Field>
        </div>
      </SettingsSection>
    </>
  );
}

function KYCSection({ onToast }) {
  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({ fullLegalName: '', dateOfBirth: '', nationality: '', countryOfResidence: '', residentialAddress: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadKyc = () => {
    setLoading(true);
    settingsService.getKyc().then(data => {
      setKyc(data);
      setForm({
        fullLegalName: data.fullLegalName || '',
        dateOfBirth: data.dateOfBirth || '',
        nationality: data.nationality || '',
        countryOfResidence: data.countryOfResidence || '',
        residentialAddress: data.residentialAddress || '',
        phone: data.phone || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadKyc(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateKyc({ ...form, stepCompleted: Math.max(kyc?.stepCompleted || 0, 1) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onToast('KYC information saved.', 'success');
      loadKyc();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await settingsService.submitKyc();
      setShowConfirm(false);
      onToast('Verification submitted. Our team will review your information shortly.', 'success');
      loadKyc();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const locked = kyc?.status === 'UNDER_REVIEW' || kyc?.status === 'VERIFIED';
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading verification status…</div>;

  return (
    <>
      {/* Status Overview */}
      <SettingsSection title="Identity & Business Verification" description="Verify your identity to unlock eligible KreazyAI features and maintain account trust.">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Verification Status</span>
              <KYCStatusBadge status={kyc?.status || 'NOT_STARTED'} />
            </div>
            {kyc?.submittedAt && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {[
              { label: 'Personal Info', done: !!kyc?.fullLegalName },
              { label: 'Documents', done: (kyc?.documents?.length || 0) > 0 },
              { label: 'Submitted', done: !!kyc?.submittedAt },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: step.done ? '#16a34a' : 'var(--bg-subtle)',
                  border: `1.5px solid ${step.done ? '#16a34a' : 'var(--border-medium)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {step.done && <Check size={11} color="#fff" />}
                </div>
                <span style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step.done ? 600 : 400 }}>
                  {step.label}
                </span>
                {i < 2 && <ChevronRight size={12} color="var(--text-muted)" />}
              </div>
            ))}
          </div>
        </div>

        {kyc?.rejectionReason && (
          <div style={{ padding: '1rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>Action Required</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{kyc.rejectionReason}</p>
          </div>
        )}

        {locked && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={14} color="#3b82f6" />
            {kyc?.status === 'UNDER_REVIEW' ? 'Your information is locked while under review.' : 'Your account is verified. Contact support to update verified information.'}
          </div>
        )}
      </SettingsSection>

      {/* Personal Identity */}
      <SettingsSection
        title="Personal Identity Information"
        description="Your personal details for identity verification. This information is private and secure."
        footer={!locked && <SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Identity Info" />}
      >
        <div className="settings-form-grid-2">
          <Field label="Full Legal Name" required hint="Exactly as shown on your government ID.">
            <TextInput value={form.fullLegalName} onChange={e => set('fullLegalName', e.target.value)} placeholder="Your Full Legal Name" disabled={locked} />
          </Field>
          <Field label="Date of Birth">
            <TextInput type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} disabled={locked} />
          </Field>
          <Field label="Nationality">
            <TextInput value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="e.g. American" disabled={locked} />
          </Field>
          <Field label="Country of Residence">
            <TextInput value={form.countryOfResidence} onChange={e => set('countryOfResidence', e.target.value)} placeholder="e.g. United States" disabled={locked} />
          </Field>
          <Field label="Phone Number">
            <TextInput value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" disabled={locked} />
          </Field>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Residential Address">
              <TextInput value={form.residentialAddress} onChange={e => set('residentialAddress', e.target.value)} placeholder="123 Main St, City, Country" disabled={locked} />
            </Field>
          </div>
        </div>
      </SettingsSection>

      {/* Documents */}
      <DocumentsSection kyc={kyc} onToast={onToast} onRefresh={loadKyc} locked={locked} />

      {/* Submit */}
      {!locked && kyc?.status !== 'NOT_STARTED' && (
        <SettingsSection title="Submit for Verification">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Once submitted, your information will be reviewed by the KreazyAI team. This process typically takes 1–3 business days.
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              background: 'linear-gradient(135deg, var(--olive-700), var(--olive-900))',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem',
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <ShieldCheck size={16} /> Submit for Verification
          </button>
        </SettingsSection>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <ShieldCheck size={32} color="var(--olive-700)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Confirm Submission</h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              You are about to submit your identity and business documents for review. Your information will be locked until the review is complete.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 2, background: 'linear-gradient(135deg, var(--olive-700), var(--olive-900))', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {submitting ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><Check size={14} /> Yes, Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DocumentsSection({ kyc, onToast, onRefresh, locked }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState('national-id');
  const [deleting, setDeleting] = useState(null);

  const DOC_TYPES = [
    { value: 'national-id', label: 'National ID Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving-license', label: 'Driving License' },
    { value: 'trade-license', label: 'Trade License' },
    { value: 'business-registration', label: 'Business Registration Certificate' },
    { value: 'tax-certificate', label: 'Tax / VAT Certificate' },
    { value: 'other', label: 'Other Business Document' },
  ];

  const reviewStatusColors = {
    PENDING: { color: 'var(--text-muted)', label: 'Under Review' },
    VERIFIED: { color: '#16a34a', label: 'Verified' },
    REJECTED: { color: '#dc2626', label: 'Rejected' },
  };

  useEffect(() => {
    settingsService.getDocuments().then(d => { setDocs(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleUploaded = (doc) => {
    setDocs(prev => [...prev, doc]);
    onToast('Document uploaded successfully.', 'success');
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await settingsService.deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      onToast('Document removed.', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <SettingsSection title="Verification Documents" description="Upload government-issued ID and business documents for identity verification.">
      {!locked && (
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.83rem', fontWeight: 600 }}>Document Type</label>
            <SelectInput value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)} options={DOC_TYPES} />
          </div>
          <DocumentUploader docType={selectedDocType} onUploaded={handleUploaded} />
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading documents…</p>
      ) : docs.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No documents uploaded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {docs.map(doc => {
            const typeLabel = DOC_TYPES.find(t => t.value === doc.docType)?.label || doc.docType;
            const rvStatus = reviewStatusColors[doc.reviewStatus] || reviewStatusColors.PENDING;
            return (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
                <FileText size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.originalName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{typeLabel} • {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rvStatus.color, flexShrink: 0 }}>{rvStatus.label}</span>
                {!locked && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleting === doc.id}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px', flexShrink: 0 }}
                    title="Remove document"
                  >
                    {deleting === doc.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SettingsSection>
  );
}

function TeamSection({ user, onToast }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'MEMBER' });
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(null);

  const loadTeam = () => {
    settingsService.getTeam().then(t => { setTeam(t); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadTeam(); }, []);

  const handleInvite = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      onToast('Name and email are required.', 'error');
      return;
    }
    setInviting(true);
    try {
      await settingsService.inviteMember(inviteForm);
      setShowInvite(false);
      setInviteForm({ name: '', email: '', role: 'MEMBER' });
      onToast('Invitation sent.', 'success');
      loadTeam();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      await settingsService.removeMember(id);
      setTeam(prev => prev.filter(m => m.id !== id));
      onToast('Team member removed.', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setRemoving(null);
    }
  };

  const roleColors = { Owner: '#16a34a', ADMIN: '#7c3aed', MANAGER: '#d97706', MEMBER: 'var(--text-muted)', PENDING: '#3b82f6' };

  return (
    <SettingsSection
      title={`Team Members (${team.length})`}
      description="Manage who has access to your KreazyAI workspace."
      footer={(
        <button
          onClick={() => setShowInvite(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, var(--olive-700), var(--olive-900))', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={14} /> Invite Member
        </button>
      )}
    >
      {showInvite && (
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.875rem' }}>Invite a Team Member</p>
          <div className="team-invite-grid">
            <Field label="Name" required>
              <TextInput value={inviteForm.name} onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
            </Field>
            <Field label="Email" required>
              <TextInput type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
            </Field>
            <Field label="Role">
              <SelectInput value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} options={[
                { value: 'ADMIN', label: 'Admin' },
                { value: 'MANAGER', label: 'Manager' },
                { value: 'MEMBER', label: 'Member' },
              ]} />
            </Field>
            <button
              onClick={handleInvite}
              disabled={inviting}
              style={{ background: 'var(--olive-700)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', height: '36px' }}
            >
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading team…</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {team.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                        {m.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: '0.78rem', fontWeight: 700, color: roleColors[m.role] || 'var(--text-muted)' }}>{m.role}</span></td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.status === 'Active' || m.status === 'ACTIVE' ? '#16a34a' : '#3b82f6' }}>
                      {m.status === 'Active' || m.status === 'ACTIVE' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.invitedAt ? new Date(m.invitedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    {!m.isOwner && (
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={removing === m.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        {removing === m.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingsSection>
  );
}

function SecuritySection({ onToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ curr: false, new: false, conf: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Enter your current password.';
    if (!form.newPassword || form.newPassword.length < 8) e.newPassword = 'New password must be at least 8 characters.';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePw = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await settingsService.changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
      onToast('Password changed successfully.', 'success');
    } catch (err) {
      onToast(err.message || 'Unable to update password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pwStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['', '#dc2626', '#d97706', '#ca8a04', '#16a34a', '#059669'];
    return { level: s, label: labels[s] || '', color: colors[s] || '' };
  };

  const strength = pwStrength(form.newPassword);

  return (
    <SettingsSection
      title="Change Password"
      description="Use a strong, unique password to protect your account and store."
      footer={<SaveButton saving={saving} saved={saved} onClick={handleChangePw} label="Update Password" icon={Lock} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
        {saved && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Password updated successfully. Use your new password the next time you sign in.
          </div>
        )}

        <Field label="Current Password" required error={errors.currentPassword}>
          <TextInput
            type={showPw.curr ? 'text' : 'password'}
            value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter current password"
            error={errors.currentPassword}
            suffix={
              <button type="button" onClick={() => setShowPw(s => ({ ...s, curr: !s.curr }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                {showPw.curr ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
        </Field>

        <Field label="New Password" required error={errors.newPassword} hint="Minimum 8 characters. Use uppercase, numbers, and symbols for a stronger password.">
          <TextInput
            type={showPw.new ? 'text' : 'password'}
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Enter new password"
            error={errors.newPassword}
            suffix={
              <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          {form.newPassword && (
            <div style={{ display: 'flex', gap: '3px', marginTop: '6px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength.level ? strength.color : 'var(--border-light)', transition: 'background 0.2s' }} />
              ))}
              <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 700, marginLeft: '6px' }}>{strength.label}</span>
            </div>
          )}
        </Field>

        <Field label="Confirm New Password" required error={errors.confirmPassword}>
          <TextInput
            type={showPw.conf ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="Confirm new password"
            error={errors.confirmPassword}
            suffix={
              <button type="button" onClick={() => setShowPw(s => ({ ...s, conf: !s.conf }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                {showPw.conf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
        </Field>

        {/* Dedicated primary update button inside the card */}
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <SaveButton saving={saving} saved={saved} onClick={handleChangePw} label="Update Password" icon={Lock} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Must be at least 8 characters
          </span>
        </div>
      </div>
    </SettingsSection>
  );
}

function NotificationsSection({ onToast }) {
  const DEFAULT_NOTIFICATION_PREFS = {
    orderNotifications: true,
    aiNotifications: true,
    automationFailures: true,
    integrationAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
  };

  const [prefs, setPrefs] = useState(() => {
    try {
      const cached = localStorage.getItem('kreazy_notification_prefs');
      return cached ? { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(cached) } : DEFAULT_NOTIFICATION_PREFS;
    } catch {
      return DEFAULT_NOTIFICATION_PREFS;
    }
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsService.getNotificationPrefs()
      .then(d => {
        if (d) setPrefs(p => ({ ...p, ...d }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.saveNotificationPrefs(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onToast('Notification preferences saved successfully.', 'success');
    } catch (err) {
      onToast(err.message || 'Unable to save preferences.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleEnableAll = () => {
    setPrefs({
      orderNotifications: true,
      aiNotifications: true,
      automationFailures: true,
      integrationAlerts: true,
      securityAlerts: true,
      marketingEmails: true,
    });
    onToast('All notification modes enabled. Remember to save changes.', 'info');
  };

  const handleMuteMarketing = () => {
    setPrefs(p => ({
      ...p,
      marketingEmails: false,
    }));
    onToast('Marketing emails muted. Operational alerts remain active.', 'info');
  };

  const TOGGLES = [
    { key: 'orderNotifications', label: 'Order Notifications', desc: 'Instant alerts for new orders, customer status changes, and cancellations.' },
    { key: 'aiNotifications', label: 'AI Agent Notifications', desc: 'Real-time conversation handover requests and autonomous bot trigger alerts.' },
    { key: 'automationFailures', label: 'Automation Failures', desc: 'Priority notifications when an automated WhatsApp or CRM rule errors.' },
    { key: 'integrationAlerts', label: 'Integration Alerts', desc: 'Channel disconnections, API token expirations, and webhook failures.' },
    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Suspicious login attempts, password changes, and 2FA activities.' },
    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates, merchant success strategies, and KreazyAI feature news.' },
  ];

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Control which notifications and alert modes you receive for your store."
      footer={<SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Notification Preferences" icon={Bell} />}
    >
      {/* Quick modes toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        padding: '0.85rem 1rem', background: 'var(--mint-soft, #EFFBF5)', borderRadius: '10px',
        border: '1px solid var(--border-medium, #D9E9E1)', marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} color="var(--primary, #087A4A)" />
          <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--primary-dark, #092A20)' }}>Quick Modes:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleEnableAll}
            style={{
              fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
              border: '1px solid var(--border-medium, #D9E9E1)', background: 'var(--bg-card, #fff)',
              color: 'var(--primary, #087A4A)', cursor: 'pointer'
            }}
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={handleMuteMarketing}
            style={{
              fontSize: '0.78rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
              border: '1px solid var(--border-medium, #D9E9E1)', background: 'var(--bg-card, #fff)',
              color: 'var(--text-secondary, #52645D)', cursor: 'pointer'
            }}
          >
            Quiet Mode (Mute Marketing)
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {TOGGLES.map((t, i) => {
          const isChecked = Boolean(prefs[t.key]);
          return (
            <div
              key={t.key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.1rem 0', gap: '1rem',
                borderBottom: i < TOGGLES.length - 1 ? '1px solid var(--border-light, #D9E9E1)' : 'none',
              }}
            >
              <div style={{ maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.label}</p>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                    background: isChecked ? 'rgba(22,163,74,0.1)' : 'var(--bg-subtle, #EFFBF5)',
                    color: isChecked ? '#16a34a' : 'var(--text-muted)'
                  }}>
                    {isChecked ? 'Enabled' : 'Muted'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.desc}</p>
              </div>
              <Toggle checked={isChecked} onChange={val => set(t.key, val)} />
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
        <SaveButton saving={saving} saved={saved} onClick={handleSave} label="Save Notification Preferences" icon={Bell} />
      </div>
    </SettingsSection>
  );
}

function BillingSection({ user, onToast }) {
  const { updateUser } = useAuth();

  // Storage key for user billing subscription
  const [activePlan, setActivePlan] = useState(() => {
    try {
      const stored = localStorage.getItem('kreazy_user_subscription');
      if (stored) return JSON.parse(stored);
    } catch {}

    // Check if user object has active purchased plan
    const planName = user?.plan || '';
    const isPaid = user?.isSubscribed && planName && !['free', 'free trial', 'none', ''].includes(planName.toLowerCase());
    if (isPaid) {
      return {
        name: planName,
        price: planName.includes('299') ? 299 : (planName.includes('49') ? 49 : 119),
        conversationsLimit: planName.includes('Scale') ? 25000 : (planName.includes('Starter') ? 1000 : 5000),
        conversationsUsed: 142,
        renewalDate: 'November 12, 2026',
        paymentMethod: 'Visa ending in •••• 4242',
        invoices: [
          { id: 'INV-2026-001', date: 'October 12, 2026', amount: '$119.00', status: 'Paid' }
        ]
      };
    }
    return null;
  });

  const [checkoutModal, setCheckoutModal] = useState(null); // { planName, price, limit }
  const [processing, setProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const PLANS = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: 49,
      period: '/ month',
      conversations: '1,000',
      conversationsNum: 1000,
      badge: null,
      description: 'Ideal for emerging merchants automating their first WhatsApp store channel.',
      features: [
        '1,000 autonomous AI conversations / mo',
        '1 Connected WhatsApp Business account',
        'Real-time catalog & inventory sync',
        'Basic order capture & CRM storage',
        'Standard email & community support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: 119,
      period: '/ month',
      conversations: '5,000',
      conversationsNum: 5000,
      badge: 'Most Popular',
      description: 'Built for scaling retail brands requiring multi-channel AI automation.',
      features: [
        '5,000 autonomous AI conversations / mo',
        'WhatsApp + Instagram + Messenger omnichannel',
        'Autonomous order placement & cart checkout',
        'AI sizing, discount & delivery advice',
        'Priority 24/7 AI Copilot support',
        'Dedicated webhook & Shopify/Woo sync'
      ]
    },
    {
      id: 'scale',
      name: 'Scale Plan',
      price: 299,
      period: '/ month',
      conversations: '25,000',
      conversationsNum: 25000,
      badge: 'High Volume',
      description: 'Enterprise-grade speed and custom fine-tuned agents for high-volume stores.',
      features: [
        '25,000 autonomous AI conversations / mo',
        'Unlimited social channels & team seats',
        'Custom fine-tuned AI prompts & catalog training',
        'Dedicated SLA & 99.9% uptime guarantee',
        'Dedicated customer success manager',
        'Custom ERP & payment gateway integrations'
      ]
    }
  ];

  const handleActivatePlan = (plan) => {
    setProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      const renewalStr = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const invoiceId = `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

      const newSub = {
        name: plan.name,
        price: plan.price,
        conversationsLimit: plan.conversationsNum,
        conversationsUsed: 0,
        renewalDate: renewalStr,
        paymentMethod: 'Visa ending in •••• 4242',
        invoices: [
          {
            id: invoiceId,
            date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            amount: `$${plan.price}.00`,
            status: 'Paid'
          }
        ]
      };

      setActivePlan(newSub);
      localStorage.setItem('kreazy_user_subscription', JSON.stringify(newSub));

      if (updateUser) {
        updateUser({
          isSubscribed: true,
          plan: plan.name,
          subscriptionStatus: 'active'
        });
      }

      setProcessing(false);
      setCheckoutModal(null);
      if (onToast) onToast(`🎉 You have successfully subscribed to ${plan.name}!`, 'success');
    }, 700);
  };

  const handleCancelSubscription = () => {
    setActivePlan(null);
    localStorage.removeItem('kreazy_user_subscription');
    if (updateUser) {
      updateUser({
        isSubscribed: false,
        plan: 'Free Trial',
        subscriptionStatus: 'inactive'
      });
    }
    setShowCancelConfirm(false);
    if (onToast) onToast('Your subscription has been cancelled. Your account is now on the Free Trial.', 'info');
  };

  return (
    <>
      <SettingsSection
        title="Subscription & Billing"
        description="Manage your KreazyAI subscription plan, billing details, and monthly usage limits."
      >
        {activePlan ? (
          /* ===================================================================
             ACTIVE PAID SUBSCRIPTION VIEW
             =================================================================== */
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              padding: '1.25rem 1.5rem', background: 'var(--mint-soft, #EFFBF5)', borderRadius: '12px',
              border: '1px solid var(--border-medium, #D9E9E1)', marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-dark, #092A20)' }}>
                    {activePlan.name}
                  </p>
                  <span style={{
                    background: 'rgba(22,163,74,0.12)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)',
                    borderRadius: '100px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700
                  }}>
                    Active
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary, #52645D)' }}>
                  Billed ${activePlan.price}/month • Next automatic renewal: <strong>{activePlan.renewalDate}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutModal(PLANS[1])}
                  style={{
                    background: 'var(--primary, #087A4A)', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(8, 122, 74, 0.2)'
                  }}
                >
                  Change Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  style={{
                    background: 'var(--bg-card, #fff)', border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626',
                    borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel Plan
                </button>
              </div>
            </div>

            {/* Usage meters */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Monthly Conversation Usage</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                  {activePlan.conversationsUsed.toLocaleString()} / {activePlan.conversationsLimit.toLocaleString()} used
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-light, #E6F0EB)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.max(2, (activePlan.conversationsUsed / activePlan.conversationsLimit) * 100)}%`,
                  height: '100%', background: 'var(--primary, #087A4A)', borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Conversations reset automatically on the 1st of every calendar month.
              </p>
            </div>

            {/* Payment method card */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--mint-soft)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{activePlan.paymentMethod}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Default payment method for auto-renewal</div>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--mint-soft)', padding: '4px 10px', borderRadius: '6px' }}>
                Active & Verified
              </span>
            </div>

            {/* Invoices List */}
            <div>
              <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Billing History & Invoices
              </h4>
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-subtle, #EFFBF5)', borderBottom: '1px solid var(--border-light)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Invoice #</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlan.invoices.map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.id}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{inv.date}</td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.amount}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => onToast && onToast(`Downloaded receipt for ${inv.id}`, 'success')}
                            style={{ background: 'none', border: '1px solid var(--border-medium)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================================
             EMPTY ZERO-STATE (When merchant has NOT bought anything yet)
             =================================================================== */
          <div>
            {/* Zero State Notice Banner */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              padding: '2.5rem 1.5rem', background: 'var(--mint-soft, #EFFBF5)',
              borderRadius: '16px', border: '1px solid var(--border-medium, #D9E9E1)',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--mint, #DDF7E9)', border: '2px solid var(--border-strong, #AEEBCB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem', boxShadow: '0 4px 12px rgba(8, 122, 74, 0.12)'
              }}>
                <CreditCard size={32} color="var(--primary, #087A4A)" />
              </div>

              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: '100px',
                background: 'var(--mint, #DDF7E9)', color: 'var(--primary, #087A4A)',
                marginBottom: '0.75rem', border: '1px solid var(--border-strong, #AEEBCB)'
              }}>
                Free Trial • No Paid Subscription
              </span>

              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark, #092A20)' }}>
                No Active Paid Subscription
              </h4>

              <p style={{ margin: '0 auto 1.5rem', maxWidth: '520px', fontSize: '0.88rem', color: 'var(--text-secondary, #52645D)', lineHeight: 1.55 }}>
                You have not purchased a KreazyAI subscription plan yet. Your workspace is currently on the free trial mode. When you subscribe to a plan, your billing cycle, conversation meter, and tax invoices will appear right here.
              </p>

              <button
                type="button"
                onClick={() => setCheckoutModal(PLANS[1])}
                style={{
                  background: 'var(--primary, #087A4A)', color: '#ffffff',
                  border: 'none', borderRadius: '8px', padding: '0.7rem 1.75rem',
                  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(8, 122, 74, 0.25)', transition: 'all 0.2s ease'
                }}
              >
                <Plus size={16} /> Choose a Plan to Get Started
              </button>
            </div>

            {/* Available Pricing Plans */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Select a Plan for Your Business
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Upgrade anytime to unlock higher AI conversation volumes and dedicated multi-channel features.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {PLANS.map((plan) => {
                  const isFeatured = plan.id === 'growth';
                  return (
                    <div
                      key={plan.id}
                      style={{
                        position: 'relative',
                        background: 'var(--bg-card, #ffffff)',
                        border: isFeatured ? '2px solid var(--primary, #087A4A)' : '1px solid var(--border-medium, #D9E9E1)',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: isFeatured ? '0 8px 24px rgba(8, 122, 74, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      {plan.badge && (
                        <span style={{
                          position: 'absolute', top: '-12px', right: '16px',
                          background: 'var(--primary, #087A4A)', color: '#ffffff',
                          borderRadius: '100px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(8, 122, 74, 0.3)'
                        }}>
                          {plan.badge}
                        </span>
                      )}

                      <h5 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {plan.name}
                      </h5>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', minHeight: '36px' }}>
                        {plan.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary-dark, #092A20)' }}>
                          ${plan.price}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{plan.period}</span>
                      </div>

                      <div style={{ flexGrow: 1, marginBottom: '1.5rem' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          What's included:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {plan.features.map((feat, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <Check size={14} color="var(--primary, #087A4A)" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCheckoutModal(plan)}
                        style={{
                          width: '100%',
                          background: isFeatured ? 'var(--primary, #087A4A)' : 'var(--mint-soft, #EFFBF5)',
                          color: isFeatured ? '#ffffff' : 'var(--primary, #087A4A)',
                          border: isFeatured ? 'none' : '1px solid var(--border-medium, #D9E9E1)',
                          borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          boxShadow: isFeatured ? '0 2px 8px rgba(8, 122, 74, 0.25)' : 'none'
                        }}
                      >
                        Subscribe to {plan.name.replace(' Plan', '')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Empty Invoices State */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Billing History & Invoices
              </h4>
              <div style={{
                padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-subtle, #EFFBF5)',
                borderRadius: '8px', border: '1px dashed var(--border-medium, #D9E9E1)'
              }}>
                <FileText size={26} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  No Invoices Available
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Invoices will be automatically generated and made available for PDF download once your first subscription payment is processed.
                </p>
              </div>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* =====================================================================
         CHECKOUT & ACTIVATION MODAL
         ===================================================================== */}
      {checkoutModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.65)', backdropFilter: 'blur(3px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => !processing && setCheckoutModal(null)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '480px', width: '100%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--mint-soft)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CreditCard size={18} color="var(--primary)" />
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-dark)' }}>
                  Confirm Subscription
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                disabled={processing}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--mint-soft)', borderRadius: '10px', border: '1px solid var(--border-medium)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-dark)' }}>{checkoutModal.name}</span>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--primary)' }}>${checkoutModal.price}/mo</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Includes {checkoutModal.conversations} autonomous conversations / month. Renews automatically monthly.
                </p>
              </div>

              {/* Payment details simulation */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Payment Method
                </label>
                <div style={{
                  padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CreditCard size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.83rem', fontWeight: 600 }}>Visa Card ending in •••• 4242</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exp 08/29</span>
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                By clicking Confirm, you agree to the KreazyAI terms of service. You may cancel your subscription at any time with one click from this dashboard.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutModal(null)}
                  disabled={processing}
                  style={{
                    flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
                    borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleActivatePlan(checkoutModal)}
                  disabled={processing}
                  style={{
                    flex: 2, background: 'var(--primary, #087A4A)', color: '#ffffff',
                    border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem',
                    fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(8, 122, 74, 0.25)', opacity: processing ? 0.75 : 1
                  }}
                >
                  {processing ? (
                    <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                  ) : (
                    <><CheckCircle2 size={15} /> Confirm & Subscribe (${checkoutModal.price}/mo)</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         CANCEL CONFIRMATION DIALOG
         ===================================================================== */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.65)', backdropFilter: 'blur(3px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setShowCancelConfirm(false)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '420px', width: '100%',
              padding: '1.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <AlertCircle size={32} color="#dc2626" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Cancel Subscription?
            </h4>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Are you sure you want to cancel your paid subscription? Your workspace will return to the Free Trial tier and your automated limits will be paused.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
                  borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Keep Plan
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                style={{
                  flex: 1, background: '#dc2626', color: '#ffffff',
                  border: 'none', borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Yes, Cancel Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeveloperSection({ onToast }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = () => {
    settingsService.getApiKeys().then(k => { setKeys(k); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { loadKeys(); }, []);

  const handleCreate = async () => {
    if (!label.trim()) { onToast('Enter a label for the API key.', 'error'); return; }
    setCreating(true);
    try {
      const result = await settingsService.createApiKey(label.trim());
      setNewKey(result);
      setLabel('');
      loadKeys();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await settingsService.revokeApiKey(id);
      setKeys(prev => prev.filter(k => k.id !== id));
      onToast('API key revoked.', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <>
      <SettingsSection title="API Keys" description="Use API keys to authenticate custom integrations and server-to-server requests.">
        {/* Create new key */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
          <div style={{ flexGrow: 1 }}>
            <Field label="Key Label">
              <TextInput value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Production Server, Shopify Integration" />
            </Field>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{ background: 'linear-gradient(135deg, var(--olive-700), var(--olive-900))', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 1.25rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          >
            {creating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
            Create Key
          </button>
        </div>

        {/* Newly created key — one-time display */}
        {newKey && (
          <div style={{ padding: '1rem', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.85rem', color: '#16a34a' }}>
              <CheckCircle2 size={14} style={{ verticalAlign: 'middle' }} /> Key Created — Copy Now!
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>This key will not be shown again. Store it securely.</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <code style={{ flexGrow: 1, fontFamily: 'monospace', fontSize: '0.8rem', background: 'var(--bg-card)', padding: '0.5rem 0.75rem', borderRadius: '6px', wordBreak: 'break-all', border: '1px solid var(--border-light)' }}>
                {newKey.rawKey}
              </code>
              <button onClick={() => handleCopy(newKey.rawKey)} style={{ background: 'var(--olive-700)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setNewKey(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px', textDecoration: 'underline' }}>
              I've saved my key
            </button>
          </div>
        )}

        {/* Existing keys list */}
        {loading ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading API keys…</p>
        ) : keys.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No API keys created yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {keys.map(k => (
              <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <Key size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{k.label}</div>
                  <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.maskedKey}</code>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '—'}
                </div>
                <button
                  onClick={() => handleRevoke(k.id)}
                  style={{ background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={13} />
          Never expose API keys in client-side code. All API calls should be server-to-server.
        </div>
      </SettingsSection>
    </>
  );
}

function DangerZoneSection({ user, onToast, onLogout }) {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_PHRASE = user?.storeName || 'DELETE MY ACCOUNT';

  return (
    <SettingsSection title="Danger Zone">
      {onLogout && (
        <div style={{ padding: '1.25rem', background: 'var(--bg-canvas-alt)', border: '1px solid var(--border-medium)', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Sign Out of Current Session</p>
            <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Log out from this merchant account on this device.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <LogOut size={15} /> Sign Out Now
          </button>
        </div>
      )}
      <div style={{ padding: '1.25rem', background: 'rgba(220,38,38,0.05)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flexGrow: 1 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#dc2626', fontSize: '0.95rem' }}>Delete Account & Business Data</p>
            <p style={{ margin: '0 0 1rem', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Permanently deletes your account, business workspace, all customer data, orders, conversations, and integrations.
              <strong> This action cannot be undone.</strong>
            </p>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
              Type <code style={{ background: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{CONFIRM_PHRASE}</code> to confirm:
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <TextInput
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                style={{ maxWidth: '280px' }}
              />
              <button
                disabled={confirmText !== CONFIRM_PHRASE}
                onClick={() => onToast('Account deletion request submitted. Our team will process this within 24h.', 'info')}
                style={{
                  background: confirmText === CONFIRM_PHRASE ? '#dc2626' : 'var(--bg-subtle)',
                  color: confirmText === CONFIRM_PHRASE ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${confirmText === CONFIRM_PHRASE ? '#dc2626' : 'var(--border-medium)'}`,
                  borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700,
                  cursor: confirmText === CONFIRM_PHRASE ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SETTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business Information', icon: Building2 },
  { id: 'kyc', label: 'KYC & Verification', icon: ShieldCheck },
  { id: 'team', label: 'Team & Access', icon: Users },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
  { id: 'developer', label: 'Developer / API', icon: Key },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export function SettingsPage({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection user={user} onToast={showToast} onLogout={onLogout} />;
      case 'business': return <BusinessSection onToast={showToast} />;
      case 'kyc': return <KYCSection onToast={showToast} />;
      case 'team': return <TeamSection user={user} onToast={showToast} />;
      case 'security': return <SecuritySection onToast={showToast} />;
      case 'notifications': return <NotificationsSection onToast={showToast} />;
      case 'billing': return <BillingSection user={user} onToast={showToast} />;
      case 'developer': return <DeveloperSection onToast={showToast} />;
      case 'danger': return <DangerZoneSection user={user} onToast={showToast} onLogout={onLogout} />;
      default: return null;
    }
  };

  return (
    <div className="settings-page-wrapper">
      {/* ── Left Settings Nav (Horizontal scrollable tabs on mobile) ── */}
      <div className="settings-nav-sidebar">
        <div className="settings-nav-heading">
          <p>Settings</p>
        </div>
        <div className="settings-nav-items">
          {NAV_SECTIONS.map(s => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            const isDanger = s.id === 'danger';
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`settings-nav-btn ${active ? 'active' : ''} ${isDanger ? 'danger' : ''}`}
              >
                <Icon size={15} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="settings-content-area">
        <div className="settings-content-inner">
          {/* Section title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800 }}>
              {NAV_SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
          </div>

          {renderSection()}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .settings-nav { display: none; }
        }
      `}</style>
    </div>
  );
}
