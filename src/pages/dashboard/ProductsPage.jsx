import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
  Check,
  Upload,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { productService } from '../../services/api';

export function ProductsPage({ user, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewingDemo, setPreviewingDemo] = useState(isDemo);

  // New product form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Apparel',
    price: '',
    stock: '',
    variants: 'Standard',
    aiKnowledge: '',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80'
  });

  const fetchProducts = async (forceDemo = false) => {
    const list = await productService.getAll(forceDemo || previewingDemo);
    setProducts(list);
  };

  useEffect(() => {
    fetchProducts();
  }, [isDemo, previewingDemo]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await productService.update(editingProduct.id, {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        variants: typeof formData.variants === 'string' ? formData.variants.split(',').map(s => s.trim()) : formData.variants
      });
    } else {
      await productService.create({
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        variants: formData.variants.split(',').map(s => s.trim()),
        channels: ['whatsapp', 'instagram']
      });
    }

    setIsAddModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Apparel',
      price: '',
      stock: '',
      variants: 'Standard',
      aiKnowledge: '',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80'
    });
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this product from catalog & AI knowledge index?")) {
      await productService.delete(id);
      fetchProducts();
    }
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      variants: Array.isArray(prod.variants) ? prod.variants.join(', ') : prod.variants,
      aiKnowledge: prod.aiKnowledge || '',
      image: prod.image || ''
    });
    setIsAddModalOpen(true);
  };

  const filtered = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="dashboard-content">
      <div className="page-title-row">
        <div>
          <h2>Product Inventory & AI Catalog</h2>
          <p style={{ fontSize: '0.9rem' }}>Real-time catalog indexed by your AI assistant for sizing guidance and instant checkouts.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {previewingDemo && !isDemo && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setPreviewingDemo(false)}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
            >
              Exit Demo Preview
            </button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}
            icon={Plus}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="capsule-filter-group" style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {['All', 'Apparel', 'Home & Living', 'Accessories', 'Fragrance'].map(cat => (
              <button
                key={cat}
                type="button"
                className={`capsule-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                style={{ flexShrink: 0 }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.825rem' }}
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>AI Knowledge Index</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-medium)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Variants: {Array.isArray(p.variants) ? p.variants.slice(0, 2).join(', ') : p.variants}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.sku}</td>
                  <td><Badge variant="olive">{p.category}</Badge></td>
                  <td style={{ fontWeight: 700, color: 'var(--bright-olive)' }}>${p.price.toFixed(2)}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--status-error-text)' : p.stock < 5 ? '#d97706' : 'var(--bright-olive)' }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    {p.stock > 0 ? (
                      <span className="badge badge-success">In Stock</span>
                    ) : (
                      <span className="badge badge-error">Out of Stock</span>
                    )}
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.aiKnowledge}>
                      <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--bright-olive)' }} />
                      {p.aiKnowledge || 'Auto-generated specs'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} title="Edit Product">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Delete Product" style={{ color: 'var(--status-error-text)' }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Clean Empty State for New Users */
        <div style={{
          padding: '3.5rem 2rem',
          border: '1px dashed var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(163, 230, 53, 0.1)',
            color: 'var(--bright-olive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Boxes size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            No products in your catalog yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Add your merchandise, prices, and sizing information. Kreazy AI indexes every SKU to automatically answer customer questions and process orders across your social channels.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="md" onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }} icon={Plus}>
              Add First Product
            </Button>
            <Button variant="subtle" size="md" onClick={() => { setPreviewingDemo(true); fetchProducts(true); }} icon={Sparkles}>
              ⚡ Preview Demo Catalog
            </Button>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProduct ? 'Edit Product & AI Specs' : 'Add Product to Catalog & AI Index'}
        maxWidth="600px"
        footer={(
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              {editingProduct ? 'Save Updates' : 'Add to Catalog'}
            </Button>
          </div>
        )}
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Linen Relaxed Trousers"
          />

          <div className="settings-form-grid-2">
            <Input
              label="SKU Identifier"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. KZ-TR-01"
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Apparel', label: 'Apparel' },
                { value: 'Home & Living', label: 'Home & Living' },
                { value: 'Accessories', label: 'Accessories' },
                { value: 'Fragrance', label: 'Fragrance' }
              ]}
            />
          </div>

          <div className="settings-form-grid-2">
            <Input
              label="Retail Price ($ USD)"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="89.00"
            />
            <Input
              label="Available Inventory Count"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="50"
            />
          </div>

          <Input
            label="Variants (comma separated)"
            value={formData.variants}
            onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
            placeholder="Small, Medium, Large"
          />

          <Textarea
            label="AI Grounding Knowledge (Sizing, material, fabric care, dimensions)"
            rows={3}
            value={formData.aiKnowledge}
            onChange={(e) => setFormData({ ...formData, aiKnowledge: e.target.value })}
            placeholder="Tell the AI assistant how to advise shoppers (e.g. fits true to size, 100% organic linen, gentle cold wash only)..."
          />
        </form>
      </Modal>
    </div>
  );
}
