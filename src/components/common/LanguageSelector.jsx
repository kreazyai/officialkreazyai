import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageSelector({ variant = 'dropdown', align = 'right' }) {
  const { currentLang, setLang, languages, currentLangInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrap" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lang-selector-btn"
        aria-expanded={isOpen}
        aria-label="Change Language"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-card, rgba(255, 255, 255, 0.85))',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-medium, #D9E9E1)',
          borderRadius: 0,
          padding: '5px 12px',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--text-primary, #092A20)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentLangInfo.flag}</span>
        <span style={{ letterSpacing: '0.2px' }}>{currentLangInfo.nativeName}</span>
        <ChevronDown size={13} style={{ opacity: 0.65, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div
          className="lang-dropdown-menu"
          style={{
            position: 'absolute',
            [align === 'right' ? 'right' : 'left']: 0,
            top: 'calc(100% + 6px)',
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-medium, #D9E9E1)',
            borderRadius: 0,
            boxShadow: '0 12px 36px rgba(9, 42, 32, 0.14)',
            padding: '6px',
            minWidth: '150px',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {languages.map((item) => {
            const isActive = currentLang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLang(item.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 0,
                  border: 'none',
                  background: isActive ? 'var(--mint-soft, #EFFBF5)' : 'transparent',
                  color: isActive ? 'var(--primary, #087A4A)' : 'var(--text-primary, #092A20)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{item.flag}</span>
                  <span>{item.nativeName}</span>
                </div>
                {isActive && <Check size={14} color="var(--primary, #087A4A)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
