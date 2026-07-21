import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, Edit3, X, Save, 
    Car, Utensils, ShieldCheck, Heart, BookOpen, Coffee, 
    Briefcase, Zap, AlertTriangle, Activity, Package, Scissors,
    Smartphone, Home, ShoppingCart, Music, Film, Plane, Camera
} from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ConfirmModal } from './ConfirmModal';

export interface CategoriaConfig {
    id: string;
    nombre: string;
    subtitulo: string;
    icono: string;
    color: string;
    orden: number;
}

const ICON_MAP: Record<string, any> = {
    'Briefcase': Briefcase,
    'Zap': Zap,
    'Car': Car,
    'Utensils': Utensils,
    'ShieldCheck': ShieldCheck,
    'Heart': Heart,
    'BookOpen': BookOpen,
    'Coffee': Coffee,
    'AlertTriangle': AlertTriangle,
    'Activity': Activity,
    'Package': Package,
    'Scissors': Scissors,
    'Smartphone': Smartphone,
    'Home': Home,
    'ShoppingCart': ShoppingCart,
    'Music': Music,
    'Film': Film,
    'Plane': Plane,
    'Camera': Camera,
};

const COLOR_OPTIONS = [
    { name: 'Azul', hex: '#3C5A99' },
    { name: 'Rosa', hex: '#E84393' },
    { name: 'Oro', hex: '#F1C40F' },
    { name: 'Cian', hex: '#00CEC9' },
    { name: 'Esmeralda', hex: '#00B894' },
    { name: 'Coral', hex: '#FF7675' },
    { name: 'Violeta', hex: '#6C5CE7' },
    { name: 'Marrón', hex: '#8D6E63' },
    { name: 'Gris', hex: '#636E72' },
];

export function CategoryManager() {
    const [categorias, setCategorias] = useState<CategoriaConfig[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Partial<CategoriaConfig> | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    const ID_HOGAR = "hogar_bimont_central";

    useEffect(() => {
        const q = query(collection(db, `hogares/${ID_HOGAR}/categorias`), orderBy('orden', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as CategoriaConfig));
            setCategorias(items);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!editing?.nombre || !editing?.icono || !editing?.color) return;
        setLoading(true);
        try {
            const data = {
                nombre: editing.nombre,
                subtitulo: editing.subtitulo || '',
                icono: editing.icono,
                color: editing.color,
                orden: editing.orden ?? categorias.length
            };

            if (editing.id) {
                await updateDoc(doc(db, `hogares/${ID_HOGAR}/categorias`, editing.id), data);
            } else {
                await addDoc(collection(db, `hogares/${ID_HOGAR}/categorias`), data);
            }
            setIsModalOpen(false);
            setEditing(null);
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Error al guardar categoría.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Eliminar Categoría",
            message: "¿Estás seguro de eliminar esta categoría? Los gastos asociados podrían quedar sin categoría visual.",
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                try {
                    await deleteDoc(doc(db, `hogares/${ID_HOGAR}/categorias`, id));
                } catch (error) {
                    console.error("Error deleting category:", error);
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-black font-sans">Configuración de Ramas</h3>
                <button 
                   onClick={() => { setEditing({ icono: 'Package', color: '#E5A93B', orden: categorias.length }); setIsModalOpen(true); }}
                   className="flex items-center gap-3 bg-[#E5A93B]/10 border border-[#E5A93B]/30 hover:bg-[#E5A93B]/20 text-[#E5A93B] px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(229, 169, 59, 0.1)]"
                >
                    <Plus className="w-4 h-4" />
                    AGREGAR RAMA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categorias.map((cat) => {
                    const Icon = ICON_MAP[cat.icono] || Package;
                    return (
                        <div key={cat.id} className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between group shadow-xl hover:border-[#E5A93B]/40 transition-all duration-300">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[#161a23] shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-105" style={{ backgroundColor: cat.color }}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-base font-sans tracking-tight">{cat.nombre}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">{cat.subtitulo || 'Sin subtítulo'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all pr-2 translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => { setEditing(cat); setIsModalOpen(true); }} className="p-2.5 bg-white/5 hover:bg-[#E5A93B]/20 rounded-xl text-gray-400 hover:text-[#E5A93B] border border-white/5 transition-all">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(cat.id)} className="p-2.5 bg-white/5 hover:bg-[#ff007f]/20 rounded-xl text-gray-400 hover:text-[#ff007f] border border-white/5 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-[#0D0E15]/95 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
                    <div className="bg-[#161a23]/95 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-10 relative">
                        <div className="absolute top-[-10%] right-[-20%] w-[350px] h-[350px] bg-[#E5A93B]/10 rounded-full blur-[120px] pointer-events-none" />

                        <div className="flex justify-between items-center mb-10 relative z-10 border-b border-white/5 pb-6">
                            <div>
                                <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#E5A93B] font-black mb-2">ARCHIVE_MANAGER // BRANCH</p>
                                <h2 className="text-white font-serif text-2xl font-bold uppercase tracking-tight">{editing?.id ? 'Editar Rama' : 'Nueva Rama'}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-sans font-black uppercase tracking-widest pl-1">Identificador</label>
                                    <input 
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-5 text-white font-bold outline-none focus:border-[#E5A93B] transition-all shadow-inner"
                                        value={editing?.nombre || ''}
                                        onChange={e => setEditing({...editing, nombre: e.target.value})}
                                        placeholder="Ej: Ocio"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-sans font-black uppercase tracking-widest pl-1">Descriptor</label>
                                    <input 
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-5 text-white font-bold outline-none focus:border-[#E5A93B] transition-all shadow-inner"
                                        value={editing?.subtitulo || ''}
                                        onChange={e => setEditing({...editing, subtitulo: e.target.value})}
                                        placeholder="Ej: Recreación"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-gray-500 font-sans font-black uppercase tracking-widest pl-1 block">Croma de Identificación</label>
                                <div className="flex flex-wrap gap-4 p-5 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                                    {COLOR_OPTIONS.map(c => (
                                        <button 
                                            key={c.hex} 
                                            onClick={() => setEditing({...editing, color: c.hex})}
                                            className={`w-9 h-9 rounded-full border-2 transition-all ${editing?.color === c.hex ? 'border-white scale-125 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-110'}`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-gray-500 font-sans font-black uppercase tracking-widest pl-1 block">Vector Táctico (Ícono)</label>
                                <div className="grid grid-cols-6 gap-3 max-h-[160px] overflow-y-auto pr-3 bg-black/30 p-5 rounded-2xl border border-white/5 custom-scrollbar shadow-inner">
                                    {Object.entries(ICON_MAP).map(([key, Icon]) => (
                                        <button 
                                            key={key}
                                            onClick={() => setEditing({...editing, icono: key})}
                                            className={`p-3.5 rounded-xl flex items-center justify-center transition-all ${editing?.icono === key ? 'bg-[#E5A93B]/20 border border-[#E5A93B]/40 text-[#E5A93B] shadow-inner scale-110' : 'text-gray-500 hover:text-white hover:bg-white/10 border border-transparent'}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#E5A93B] to-[#00f0ff] py-5 rounded-2xl text-[#0D0E15] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(229, 169, 59, 0.3)] transition-all disabled:opacity-50 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'SINCRONIZANDO...' : 'GUARDAR CAMBIOS'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmModal
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
