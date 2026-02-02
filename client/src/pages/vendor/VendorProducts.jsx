import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Package, Edit3, Trash2,
    MoreVertical, Tag, DollarSign, Image as ImageIcon,
    CheckCircle, XCircle, AlertCircle, Eye,
    ArrowUpRight, Sparkles, Settings, X, Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';

const VendorProducts = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [error, setError] = useState(null);

    // Categories state
    const [categories, setCategories] = useState([]);
    const [vendorType, setVendorType] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
    const [savingCategory, setSavingCategory] = useState(false);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        is_available: true,
        stock_count: 50
    });

    // Fetch products and categories from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch products
                const productsResponse = await marketplaceService.getMyProducts();
                if (productsResponse.success) {
                    setProducts(productsResponse.products || []);
                }

                // Fetch categories
                const categoriesResponse = await marketplaceService.getMyCategories();
                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.categories || []);
                    setVendorType(categoriesResponse.vendorType);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOpenAddModal = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: categories.length > 0 ? categories[0].name : '',
            image_url: '',
            is_available: true,
            stock_count: 50
        });
        setSelectedProduct(null);
        setIsAddModalOpen(true);
    };

    const handleOpenDetailModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image_url: product.image_url,
            is_available: product.is_available,
            stock_count: product.stock_count
        });
        setIsDetailModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image file selection and convert to base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }

            // Convert to base64 and store in formData
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image_url: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                image_url: formData.image_url,
                is_available: formData.is_available,
                stock_count: parseInt(formData.stock_count) || 50
            };

            if (selectedProduct) {
                // Update existing product
                const response = await marketplaceService.updateProduct(selectedProduct.id, productData);
                if (response.success) {
                    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? response.product : p));
                }
            } else {
                // Create new product
                const response = await marketplaceService.createProduct(productData);
                if (response.success) {
                    setProducts(prev => [response.product, ...prev]);
                }
            }
            setIsAddModalOpen(false);
            setIsDetailModalOpen(false);
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setSaving(true);
                const response = await marketplaceService.deleteProduct(id);
                if (response.success) {
                    setProducts(prev => prev.filter(p => p.id !== id));
                    setIsDetailModalOpen(false);
                }
            } catch (err) {
                console.error('Error deleting product:', err);
                setError(err.message || 'Failed to delete product');
            } finally {
                setSaving(false);
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-700 pb-24 relative selection:bg-primary-100 selection:text-primary-900">
            {/* Premium Ambient Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[120px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-rose-500/5 to-orange-500/5 rounded-full blur-[100px] mix-blend-multiply"></div>
                <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px] mix-blend-multiply"></div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700 font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <XCircle size={20} />
                    </button>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Products
                        <span className="bg-white/50 backdrop-blur-sm border border-gray-100 text-gray-500 text-sm px-3 py-1 rounded-xl font-bold shadow-sm">
                            {products.length} Items
                        </span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 text-lg">Manage your shop's inventory and catalog</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="group relative px-6 py-3 rounded-2xl bg-gray-900 text-white font-bold shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 transition-all hover:-translate-y-1 active:translate-y-0 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                        <Plus size={20} strokeWidth={3} className="text-primary-400" /> Add New Product
                    </span>
                </button>
            </div>

            {/* Controls Bar */}
            <div className="bg-white/70 backdrop-blur-xl p-2 rounded-[1.5rem] border border-white/20 shadow-lg shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-6 z-30 transition-all">
                {/* Tabs */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
                    <button
                        onClick={() => setSelectedCategory('ALL')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 relative overflow-hidden ${selectedCategory === 'ALL'
                            ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5 scale-100'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'
                            }`}
                    >
                        ALL
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 relative overflow-hidden ${selectedCategory === cat.name
                                ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5 scale-100'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-4 py-2.5 rounded-lg text-xs font-black tracking-wider text-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center gap-1"
                    >
                        <Settings size={14} /> Manage
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/50 border border-gray-100 focus:border-primary-300 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-primary-100/50 transition-all shadow-sm group-hover:shadow-md"
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Add New Card */}
                <button
                    onClick={handleOpenAddModal}
                    className="group border-2 border-dashed border-gray-200 hover:border-primary-300/50 rounded-[2.5rem] h-full min-h-[360px] flex flex-col items-center justify-center gap-6 text-gray-400 hover:text-primary-600 hover:bg-primary-50/30 transition-all duration-300"
                >
                    <div className="h-20 w-20 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary-200/50 transition-all duration-300">
                        <Plus size={32} strokeWidth={2.5} />
                    </div>
                    <div className="text-center">
                        <span className="font-black text-lg block mb-1">Add Product</span>
                        <span className="text-xs font-medium text-gray-400">Expand your menu</span>
                    </div>
                </button>

                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        onClick={() => handleOpenDetailModal(product)}
                        className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/40 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        {/* Image Area */}
                        <div className="h-56 w-full bg-gray-50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Tags */}
                            <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
                                <span className="bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm border border-white/20">
                                    {product.category}
                                </span>
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10 ${product.is_available
                                    ? 'bg-emerald-500/90 text-white'
                                    : 'bg-rose-500/90 text-white'
                                    }`}>
                                    {product.is_available ? 'In Stock' : 'Sold Out'}
                                </span>
                            </div>

                            {/* Hover Action */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                <span className="bg-white/95 backdrop-blur-md text-gray-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                                    <Edit3 size={16} /> Edit Details
                                </span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-7">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors line-clamp-1 flex-1 pr-2">
                                    {product.name}
                                </h3>
                                <div className="text-gray-900 font-black text-lg bg-gray-50 px-3 py-1 rounded-lg">
                                    ৳{product.price}
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                                {product.description}
                            </p>

                            <div className="flex items-center justify-between pt-5 border-t border-dashed border-gray-100">
                                <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Package size={14} className="mr-1.5 text-gray-300" /> {product.sold_count} Sold
                                </div>
                                <div className={`text-xs font-bold flex items-center gap-1.5 ${product.stock_count < 10 ? 'text-orange-500' : 'text-emerald-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${product.stock_count < 10 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                    {product.stock_count} Left
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Modal */}
            {(isAddModalOpen || isDetailModalOpen) && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-500"
                        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                        onClick={() => { setIsAddModalOpen(false); setIsDetailModalOpen(false); }}
                    ></div>

                    {/* Modal Content */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden relative z-[101] shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/50 ring-1 ring-black/5 flex flex-col">

                        {/* Improved Glass Header - Sticky */}
                        <div className="sticky top-0 bg-white/70 backdrop-blur-xl px-10 py-6 border-b border-gray-100 flex justify-between items-center z-[102] shadow-sm">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {isAddModalOpen ? 'Create Product' : 'Edit Product'}
                                </h2>
                                <p className="text-sm text-gray-500 font-bold mt-1 flex items-center gap-2">
                                    <Sparkles size={14} className="text-yellow-500" />
                                    {isAddModalOpen ? 'Add a new item to your menu' : 'Update details and pricing'}
                                </p>
                            </div>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsDetailModalOpen(false); }}
                                className="h-12 w-12 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all hover:rotate-90 border border-gray-100 shadow-sm"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-10">
                            <form onSubmit={handleSaveProduct} className="space-y-8">
                                {/* Image Upload */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Product Image</label>
                                    <div className="group relative rounded-[2rem] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 min-h-[240px] flex flex-col items-center justify-center text-center transition-all hover:border-primary-300/50 hover:bg-primary-50/10">
                                        {formData.image_url ? (
                                            <>
                                                <img src={formData.image_url} alt="Preview" className="w-full h-64 object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer text-white font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                                                        Change Image
                                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="p-8 cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 text-gray-300 group-hover:text-primary-400 group-hover:scale-110 transition-all">
                                                    <ImageIcon size={32} />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">Click to upload image</p>
                                                <p className="text-gray-300 text-xs mt-1">PNG, JPG up to 5MB</p>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="col-span-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Product Info</label>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Product Name"
                                                className="w-full bg-gray-50 hover:bg-white focus:bg-white border text-lg border-gray-100 focus:border-primary-300 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-gray-300"
                                                required
                                            />

                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="Describe the product..."
                                                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-100 focus:border-primary-300 rounded-2xl px-5 py-4 font-medium text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-gray-300 resize-none"
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">Pricing & Category</label>

                                        <div className="relative">
                                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-100 focus:border-primary-300 rounded-2xl pl-12 pr-5 py-4 font-black text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="relative">
                                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-100 focus:border-primary-300 rounded-2xl pl-12 pr-10 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all appearance-none cursor-pointer"
                                                required
                                            >
                                                {categories.length === 0 ? (
                                                    <option value="">No categories - Add one first</option>
                                                ) : (
                                                    categories.map(cat => (
                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                    ))
                                                )}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-4 border-gray-200">
                                                <ArrowUpRight size={14} className="text-gray-400 rotate-45" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">Inventory</label>

                                        <div className="relative">
                                            <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                name="stock_count"
                                                value={formData.stock_count}
                                                onChange={handleInputChange}
                                                placeholder="Stock"
                                                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-100 focus:border-primary-300 rounded-2xl pl-12 pr-5 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                            />
                                        </div>

                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:shadow-sm transition-all group">
                                            <span className="font-bold text-gray-600 group-hover:text-primary-600 transition-colors">Mark as Active</span>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    name="is_available"
                                                    checked={formData.is_available}
                                                    onChange={handleInputChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Assets</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="url"
                                                name="image_url"
                                                value={formData.image_url}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-100 focus:border-primary-300 rounded-2xl pl-12 pr-5 py-4 font-medium text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-4 mt-4">
                                    {isDetailModalOpen && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(selectedProduct.id)}
                                            className="px-6 py-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 hover:text-red-600 flex items-center gap-2 transition-all active:scale-95"
                                        >
                                            <Trash2 size={20} />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    )}

                                    <div className="flex-1"></div>

                                    <button
                                        type="button"
                                        onClick={() => { setIsAddModalOpen(false); setIsDetailModalOpen(false); }}
                                        className="px-8 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-gray-900/20 flex items-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckCircle size={20} />}
                                        {isAddModalOpen ? 'Create Product' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Manage Categories</h2>
                                <p className="text-sm text-gray-500 mt-1">Add, edit, or remove product categories</p>
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Add New Category */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="New category name..."
                                        className="w-full bg-white border border-gray-200 focus:border-primary-300 rounded-xl px-4 py-3 font-medium text-gray-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={newCategoryColor}
                                        onChange={(e) => setNewCategoryColor(e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-md"
                                    />
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!newCategoryName.trim()) return;
                                        try {
                                            setSavingCategory(true);
                                            const response = await marketplaceService.createCategory({
                                                name: newCategoryName.trim().toUpperCase(),
                                                color: newCategoryColor
                                            });
                                            if (response.success) {
                                                setCategories([...categories, response.category]);
                                                setNewCategoryName('');
                                                setNewCategoryColor('#6366f1');
                                            }
                                        } catch (err) {
                                            alert(err.message || 'Failed to create category');
                                        } finally {
                                            setSavingCategory(false);
                                        }
                                    }}
                                    disabled={savingCategory || !newCategoryName.trim()}
                                    className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingCategory ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Add
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="p-6 max-h-[40vh] overflow-y-auto">
                            {categories.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Tag size={40} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No categories yet</p>
                                    <p className="text-sm">Add your first category above</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: cat.color || '#6366f1' }}
                                                />
                                                <span className="font-bold text-gray-900">{cat.name}</span>
                                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                                                    {products.filter(p => p.category === cat.name).length} products
                                                </span>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Delete "${cat.name}" category? Products using this category will need to be updated.`)) return;
                                                    try {
                                                        const response = await marketplaceService.deleteCategory(cat.id);
                                                        if (response.success) {
                                                            setCategories(categories.filter(c => c.id !== cat.id));
                                                            if (selectedCategory === cat.name) {
                                                                setSelectedCategory('ALL');
                                                            }
                                                        }
                                                    } catch (err) {
                                                        alert(err.message || 'Failed to delete category');
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProducts;
