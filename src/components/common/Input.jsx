import React from 'react';

export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  onIconRightClick,
  className = '',
  ...props
}) {
  const hasIcon = Boolean(Icon);
  const hasRightIcon = Boolean(IconRight);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}
      
      <div className={`input-wrapper-rel ${hasIcon ? 'input-with-icon' : ''} ${hasRightIcon ? 'has-icon-right' : ''}`}>
        {Icon && <Icon size={16} className="input-icon" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-input ${error ? 'is-error' : ''}`}
          {...props}
        />
        {IconRight && (
          <button
            type="button"
            className="input-action-btn"
            onClick={onIconRightClick}
            tabIndex={-1}
            aria-label="Toggle input visibility"
            title="Toggle visibility"
          >
            <IconRight size={16} />
          </button>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  hint,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`form-textarea ${error ? 'is-error' : ''}`}
        {...props}
      />

      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`form-select ${error ? 'is-error' : ''}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}
