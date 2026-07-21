import React, { useState, useEffect } from 'react';
import { Target, Gift, X, Check, Droplet, Plus, Trash2, Edit3, Save, Star, Heart, Car, Zap } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ConfirmModal } from './ConfirmModal';

export interface CofreMeta {
    id: string;
    nombre: string;
    objetivo: number;
    acumulado: number;
    icono: string;
}

interface CofresGamificacionProps {
    presupuestoSupermercadoInicial?: number;
    gastoRealSupermercadoInicial?: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'Target': <Target className="w-5 h-5" />,
    'Gift': <Gift className="w-5 h-5" />,
    'Star': <Star className="w-5 h-5" />,
    'Heart': <Heart className="w-5 h-5" />,
    'Car': <Car className="w-5 h-5" />,
    'Zap': <Zap className="w-5 h-5" />
};

export function CofresGamificacion({
    presupuestoSupermercadoInicial = 250000,
    gastoRealSupermercadoInicial = 180000
}: CofresGamificacionProps) {
    const [cofres, setCofres] = useState<CofreMeta[]>([]);
    const [isSimuladorAbierto, setIsSimuladorAbierto] = useState(false);
    const [isModalCRUDAbierto, setIsModalCRUDAbierto] = useState(false);
    const [cofreSeleccionado, setCofreSeleccionado] = useState<string | null>(null);
    const [editingCofre, setEditingCofre] = useState<Partial<CofreMeta> | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    const ID_HOGAR = "hogar_bimont_central";

    useEffect(() => {
        const q = collection(db, `hogares/${ID_HOGAR}/cofres`);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as CofreMeta));
            setCofres(items);
        });
        return () => unsubscribe();
    }, []);

    const sobranteVirtual = presupuestoSupermercadoInicial - gastoRealSupermercadoInicial;
    const haySobrante = sobranteVirtual > 0;

    const cerrarSimulador = () => {
        setIsSimuladorAbierto(true);
    };

    const handleSaveCofre = async () => {
        if (!editingCofre?.nombre || !editingCofre?.objetivo) return;
        setLoading(true);
        try {
            const data = {
                nombre: editingCofre.nombre,
                objetivo: Number(editingCofre.objetivo),
                acumulado: Number(editingCofre.acumulado ?? 0),
                icono: editingCofre.icono || 'Target'
            };

            if (editingCofre.id) {
                await updateDoc(doc(db, `hogares/${ID_HOGAR}/cofres`, editingCofre.id), data);
            } else {
                await addDoc(collection(db, `hogares/${ID_HOGAR}/cofres`), data);
            }
            setIsModalCRUDAbierto(false);
            setEditingCofre(null);
        } catch (error) {
            console.error("Error saving cofre:", error);
            alert("No se pudo guardar el cofre. Revisa tus permisos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCofre = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDialog({
            isOpen: true,
            title: "Eliminar Cofre",
            message: "¿Estás seguro de eliminar este cofre?",
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                try {
                    await deleteDoc(doc(db, `hogares/${ID_HOGAR}/cofres`, id));
                } catch (error) {
                    console.error("Error deleting cofre:", error);
                    alert("Error al eliminar.");
                }
            }
        });
    };

    const confirmarInyeccion = async () => {
        if (cofreSeleccionado && haySobrante) {
            const cofre = cofres.find(c => c.id === cofreSeleccionado);
            if (!cofre) return;
            
            try {
                await updateDoc(doc(db, `hogares/${ID_HOGAR}/cofres`, cofreSeleccionado), {
                    acumulado: cofre.acumulado + sobranteVirtual
                });
                setIsSimuladorAbierto(false);
                setCofreSeleccionado(null);
                alert(`¡Felicidades! Se inyectaron $${sobranteVirtual.toLocaleString('es-AR')} al cofre exitosamente.`);
            } catch (error) {
                console.error("Error injectando excedente:", error);
                alert("Error al inyectar.");
            }
        }
    };

    return (
        <div className="bg-[#161a23]/60 backdrop-blur-xl p-4 md:p-8 rounded-3xl shadow-2xl border border-white/10 mb-8 font-sans relative overflow-hidden">
            {/* Iluminación tipo WidgetCofresProposito */}
            <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[350px] h-[350px] bg-[#ff007f]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 relative z-10 gap-6 border-b border-white/5 pb-8">
                <div>
                   <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#ff007f] font-black mb-2">
                        REWARD_SYSTEM // CORE_OBJECTIVES
                   </p>
                   <h3 className="text-white text-2xl font-serif font-black tracking-tight flex items-center gap-3">
                        Cofres de Propósito
                   </h3>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => { setEditingCofre({ icono: 'Target', acumulado: 0 }); setIsModalCRUDAbierto(true); }}
                        className="p-3 bg-white/5 text-slate-200 rounded-2xl border border-white/10 hover:text-white hover:border-[#ff007f] hover:bg-[#ff007f]/10 transition-all flex-shrink-0"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setIsSimuladorAbierto(true)}
                        className="flex-1 sm:flex-none text-xs px-6 py-4 bg-[#E5A93B] text-[#0D0E15] rounded-2xl shadow-[0_15px_30px_rgba(229, 169, 59, 0.3)] hover:brightness-110 hover:scale-[1.02] transition-all font-black uppercase tracking-widest"
                    >
                        Ejecutar Cierre
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {cofres.map((cofre) => {
                    const porcentaje = Math.min((cofre.acumulado / cofre.objetivo) * 100, 100);
                    return (
                        <div key={cofre.id} className="bg-black/30 p-6 rounded-3xl shadow-inner border border-white/5 group relative overflow-hidden transition-all duration-500 hover:bg-black/50 hover:border-white/10">
                            
                            <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#ff007f]/5 rounded-full blur-[40px] group-hover:bg-[#ff007f]/15 transition-all pointer-events-none" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-[#ff007f] border border-white/10 group-hover:border-[#ff007f]/40 group-hover:shadow-[0_0_20px_rgba(255,0,127,0.2)] transition-all">
                                        {ICON_MAP[cofre.icono] || <Gift className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-lg font-sans tracking-tight leading-tight">{cofre.nombre}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Objetivo: {cofre.objetivo.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setEditingCofre(cofre); setIsModalCRUDAbierto(true); }}
                                            className="opacity-0 group-hover:opacity-100 p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteCofre(cofre.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 bg-white/5 rounded-xl text-red-500 hover:text-red-400 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-[#ff007f] bg-[#ff007f]/15 px-3 py-1 rounded-xl border border-[#ff007f]/30 shadow-inner text-xs font-black tracking-tighter">
                                        {Math.round(porcentaje)}%
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#ff007f] to-[#ff4d94] rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_20px_rgba(255,0,127,0.4)]"
                                        style={{ width: `${porcentaje}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Status de Inyección</span>
                                        <span className="text-white font-serif font-bold text-lg tracking-tight">${cofre.acumulado.toLocaleString('es-AR')}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Faltante</span>
                                        <span className="text-white/40 font-sans font-bold text-sm">-${(cofre.objetivo - cofre.acumulado).toLocaleString('es-AR')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal CRUD Cofre */}
            {isModalCRUDAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0E15]/95 backdrop-blur-xl p-4">
                    <div className="bg-[#161a23]/95 rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative border border-white/10">
                        <button onClick={() => setIsModalCRUDAbierto(false)} className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-10">
                            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#E5A93B] font-black mb-2">TARGET_EDITOR // ENTRY</p>
                            <h3 className="text-2xl font-serif font-bold text-white tracking-tight uppercase">
                                {editingCofre?.id ? 'Configurar Cofre' : 'Generar Cofre'}
                            </h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-sans font-black text-gray-500 mb-2 block uppercase tracking-widest pl-1">Identificador Público</label>
                                <input 
                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white font-bold outline-none focus:border-[#E5A93B] transition-all shadow-inner"
                                    value={editingCofre?.nombre || ''}
                                    onChange={e => setEditingCofre({...editingCofre, nombre: e.target.value})}
                                    placeholder="Ej: Vacaciones"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-sans font-black text-gray-500 mb-2 block uppercase tracking-widest pl-1">Objetivo ($)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white font-bold outline-none focus:border-[#E5A93B] transition-all shadow-inner"
                                        value={editingCofre?.objetivo || ''}
                                        onChange={e => setEditingCofre({...editingCofre, objetivo: Number(e.target.value)})}
                                        placeholder="100000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-sans font-black text-gray-500 mb-2 block uppercase tracking-widest pl-1">Base ($)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white font-bold outline-none focus:border-[#E5A93B] transition-all shadow-inner"
                                        value={editingCofre?.acumulado || 0}
                                        onChange={e => setEditingCofre({...editingCofre, acumulado: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-sans font-black text-gray-500 mb-2 block uppercase tracking-widest pl-1">Vector Visual</label>
                                <div className="flex gap-3 flex-wrap p-4 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                                    {Object.keys(ICON_MAP).map(key => (
                                        <button 
                                            key={key}
                                            onClick={() => setEditingCofre({...editingCofre, icono: key})}
                                            className={`p-3 rounded-xl border transition-all ${editingCofre?.icono === key ? 'bg-[#E5A93B] border-transparent text-[#0D0E15] shadow-lg scale-110' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                                        >
                                            {ICON_MAP[key]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveCofre}
                                disabled={loading}
                                className="w-full py-5 mt-6 rounded-2xl bg-[#E5A93B] hover:brightness-110 text-[#0D0E15] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(229, 169, 59, 0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'SINCRONIZANDO...' : 'GUARDAR CONFIGURACIÓN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Simulación */}
            {isSimuladorAbierto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0E15]/95 backdrop-blur-xl p-4">
                    <div className="bg-[#161a23]/95 border border-white/10 rounded-[3rem] p-10 max-w-sm w-full shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff007f]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
                        
                        <button onClick={() => setIsSimuladorAbierto(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex flex-col text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#ff007f]/20 to-[#ff007f]/5 shadow-[0_0_30px_rgba(255,0,127,0.2)] border border-[#ff007f]/30 rounded-3xl flex items-center justify-center text-[#ff007f] mb-8">
                                <Gift className="w-10 h-10" />
                            </div>
                            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-slate-500 font-black mb-3">CLUTCH_MODE // TRIGGER</p>
                            <h3 className="text-3xl font-serif font-bold text-white mb-6 tracking-tight">¡Eficiencia Táctica!</h3>
                            
                            {haySobrante ? (
                                <>
                                    <p className="text-sm font-medium text-slate-300 mb-8 leading-relaxed font-sans italic">
                                        Excedente detectado de <strong className="text-[#E5A93B] font-black not-italic">${sobranteVirtual.toLocaleString('es-AR')}</strong>. <br/>Seleccione destino de inyección.
                                    </p>
                                    
                                    <div className="flex flex-col gap-3 mb-8 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                        {cofres.map(cofre => (
                                            <button 
                                                key={cofre.id}
                                                onClick={() => setCofreSeleccionado(cofre.id)}
                                                className={`flex items-center justify-between p-4 rounded-xl transition-all border duration-300 ${cofreSeleccionado === cofre.id ? 'bg-[#ff007f]/15 border-[#ff007f] text-[#ff007f] shadow-inner scale-[1.02]' : 'bg-black/40 border-white/5 text-slate-400 hover:bg-black/60'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full border-2 transition-all ${cofreSeleccionado === cofre.id ? 'bg-[#ff007f] border-white' : 'border-slate-700'}`} />
                                                    <span className="font-black text-sm uppercase tracking-tight">{cofre.nombre}</span>
                                                </div>
                                            </button>
                                        ))}
                                        {cofres.length === 0 && (
                                            <div className="p-8 border border-dashed border-white/5 rounded-2xl opacity-40">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Sin destinos disponibles</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={confirmarInyeccion}
                                        disabled={!cofreSeleccionado}
                                        className="w-full py-5 rounded-2xl bg-[#ff007f] hover:brightness-110 text-white font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(255,0,127,0.3)] transition-all active:scale-[0.98] disabled:opacity-30"
                                    >
                                        CONFIRMAR INYECCIÓN
                                    </button>
                                </>
                            ) : (
                                <div className="p-8 bg-black/40 rounded-3xl border border-white/5 shadow-inner mt-4">
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed font-sans italic">
                                        Estatus actual: <strong className="text-white block not-italic mt-2">DÉFICIT O EQUILIBRIO PERFECTO</strong> No se detectan excedentes volcables. Mantengan la disciplina de búnker.
                                    </p>
                                </div>
                            )}
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

