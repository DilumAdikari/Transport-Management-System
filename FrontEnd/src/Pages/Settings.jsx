import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, ShieldCheck, UserCog, Truck, 
  Save, X, Loader2, Edit3, Search, Calendar, Fingerprint, 
  Settings2, Fuel, Smartphone, BadgeCheck, Building2, Plus, Trash2, AlertTriangle, Banknote, ShieldOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MODERN MUI PICKER IMPORTS ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ users: [], drivers: [], vehicles: [], departments: [] });
  const [editModal, setEditModal] = useState(null);
  
  // Alert & Confirmation States
  const [deleteConfirm, setDeleteConfirm] = useState(null); 
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(null);
  
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d, v, dep] = await Promise.all([
        API.get("/users"), API.get("/drivers"), API.get("/vehicles"), API.get("/departments")
      ]);
      setData({ 
        users: u.data || [], 
        drivers: d.data || [], 
        vehicles: v.data || [], 
        departments: dep.data || [] 
      });
    } catch (err) { toast.error("Sync Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const endpoint = editModal.type === 'user' ? `/users/update/${editModal._id}` : `/${editModal.type}s/${editModal._id}`;
    
    try {
      await API.put(endpoint, editModal);
      toast.success("Database Updated Successfully");
      setEditModal(null);
      loadData();
    } catch (err) { toast.error("Update Failed"); }
  };

  const handleAddDept = async () => {
    if(!newDept.name) return toast.error("Department Name is required");
    try {
      await API.post("/departments", newDept);
      toast.success("Department Added");
      setNewDept({ name: "", code: "" });
      loadData();
    } catch (err) { toast.error("Failed to add department"); }
  };

  const confirmDeleteDept = async () => {
    try {
      await API.delete(`/departments/${deleteConfirm}`);
      toast.success("Department Removed");
      setDeleteConfirm(null);
      loadData();
    } catch (err) { toast.error("Error deleting department"); }
  };

  const confirmDeleteUser = async () => {
    try {
      await API.delete(`/users/${userDeleteConfirm}`);
      toast.success("User Access Revoked");
      setUserDeleteConfirm(null);
      loadData();
    } catch (err) { toast.error("Error revoking user access"); }
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY DELETE this driver from the database?")) return;
    try {
      await API.delete(`/drivers/${id}`);
      toast.success("Driver Deleted Successfully");
      setEditModal(null);
      loadData();
    } catch (err) { toast.error("Delete Failed"); }
  };

  const datePickerSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: '#f8fafc',
        '& fieldset': { border: 'none' },
        '&.Mui-focused': { backgroundColor: '#fff', border: '2px solid #eab308' },
        height: '52px',
        fontWeight: 700,
        fontSize: '13px',
        color: '#1e293b'
    },
    '& .MuiSvgIcon-root': { color: '#eab308' }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-yellow-600" size={40} /></div>;

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20" style={{ fontFamily: themeFont }}>
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tighter uppercase">
            <div className="p-2 bg-yellow-400 rounded-lg shadow-md"><SettingsIcon size={20}/></div> Master Database Management
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Review & Modify All System Assets</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-slate-100 pb-4 overflow-x-auto custom-scrollbar">
        <TabBtn id="users" label="Users" icon={<ShieldCheck size={18}/>} active={activeTab} set={setActiveTab} />
        <TabBtn id="drivers" label="Drivers" icon={<UserCog size={18}/>} active={activeTab} set={setActiveTab} />
        <TabBtn id="vehicles" label="Vehicles" icon={<Truck size={18}/>} active={activeTab} set={setActiveTab} />
        <TabBtn id="depts" label="Departments" icon={<Building2 size={18}/>} active={activeTab} set={setActiveTab} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-widest">{activeTab} Details List</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><Search size={14}/> Real-time Sync Active</div>
        </div>

        {activeTab === "depts" ? (
          <div className="p-10 animate-in fade-in duration-500">
            <div className="max-w-2xl space-y-6 mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Register New Department</h3>
              <div className="flex gap-3">
                <div className="form-group flex-1"><input placeholder="Department Name" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} /></div>
                <div className="form-group w-32"><input placeholder="Code" value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} /></div>
                <button onClick={handleAddDept} className="bg-slate-900 text-yellow-400 px-6 rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><Plus size={18}/> Add</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.departments.map(dept => (
                <div key={dept._id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group hover:border-yellow-400 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{dept.code || 'N/A'}</p>
                  </div>
                  <button onClick={() => setDeleteConfirm(dept._id)} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  {activeTab === "users" && <><th className="px-8 py-6">Full Name</th><th className="px-8 py-6">Username</th><th className="px-8 py-6">Department</th><th className="px-8 py-6">Role</th></>}
                  {activeTab === "drivers" && <><th className="px-8 py-6">Name</th><th className="px-8 py-6">Phone</th><th className="px-8 py-6">License</th><th className="px-8 py-6">Exp</th><th className="px-8 py-6">Action</th></>}
                  {activeTab === "vehicles" && (
                    <>
                      <th className="px-8 py-6">Plate</th>
                      <th className="px-8 py-6">Brand</th>
                      <th className="px-8 py-6 text-yellow-600">Cost (1KM)</th>
                      <th className="px-8 py-6 text-right">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-[13px] font-semibold divide-y divide-slate-50">
                {activeTab === "users" && data.users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5 text-slate-900">{u.name}</td>
                    <td className="px-8 py-5 text-slate-500">{u.username}</td>
                    <td className="px-8 py-5"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{u.department || "Unassigned"}</span></td>
                    <td className="px-8 py-5"><span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span></td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => setEditModal({...u, type: 'user'})} className="edit-btn"><Edit3 size={14}/></button>
                      <button onClick={() => setUserDeleteConfirm(u._id)} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                {activeTab === "drivers" && data.drivers.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 text-slate-900 font-bold">{d.name}</td>
                    <td className="px-8 py-5 text-slate-500">{d.phone}</td>
                    <td className="px-8 py-5 text-slate-500 font-mono text-[11px]">{d.licenseNo || '--'}</td>
                    <td className="px-8 py-5"><span className="text-red-500 font-bold">{d.licenseExpire || 'N/A'}</span></td>
                    <td className="px-8 py-5 text-right"><button onClick={() => setEditModal({...d, type: 'driver'})} className="edit-btn"><Edit3 size={14}/></button></td>
                  </tr>
                ))}
                {activeTab === "vehicles" && data.vehicles.map(v => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 text-slate-900 font-black uppercase">{v.plateNumber}</td>
                    <td className="px-8 py-5 text-slate-500">{v.brand} {v.modelName}</td>
                    <td className="px-8 py-5 text-yellow-700 font-black">Rs. {(Number(v.pricePerKM) || 0).toFixed(2)}</td>
                    <td className="px-8 py-5 text-right"><button onClick={() => setEditModal({...v, type: 'vehicle'})} className="edit-btn"><Edit3 size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALS (EDIT & DELETE) --- */}
      <AnimatePresence>
        {/* EDIT MODAL */}
        {editModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-3"><Edit3 size={18} className="text-yellow-400"/> Modify {editModal.type}</h3>
                <button onClick={() => setEditModal(null)} className="p-2 bg-white/10 rounded-full hover:bg-red-500 transition-all"><X size={18}/></button>
              </div>
              <form onSubmit={handleUpdate} className="p-10 space-y-5">
                <div className="space-y-4 max-h-[450px] overflow-y-auto px-2 custom-scrollbar">
                    {editModal.type === 'user' ? (
                        <>
                          <div className="form-group"><label>Name</label><input value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})} /></div>
                          <div className="form-group">
                            <label>Department</label>
                            <select className="input-style" value={editModal.department} onChange={e => setEditModal({...editModal, department: e.target.value})}>
                              {data.departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div className="form-group"><label>New Password</label><input type="password" onChange={e => setEditModal({...editModal, password: e.target.value})} placeholder="Leave blank to keep" /></div>
                        </>
                    ) : editModal.type === 'driver' ? (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <div className="form-group"><label>Driver Name</label><input value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})} /></div>
                          <div className="form-group"><label>Phone</label><input value={editModal.phone} onChange={e => setEditModal({...editModal, phone: e.target.value})} /></div>
                          <div className="form-group"><label>License No</label><input value={editModal.licenseNo} onChange={e => setEditModal({...editModal, licenseNo: e.target.value})} /></div>
                          <div className="form-group">
                            <label>License Expiry</label>
                            <DatePicker 
                              value={dayjs(editModal.licenseExpire)} 
                              onChange={(val) => setEditModal({...editModal, licenseExpire: val.format('YYYY-MM-DD')})}
                              slotProps={{ textField: { fullWidth: true, sx: datePickerSx } }}
                            />
                          </div>
                        </LocalizationProvider>
                    ) : (
                        Object.keys(editModal).filter(k => !['_id', '__v', 'createdAt', 'updatedAt', 'type'].includes(k)).map(key => (
                            <div key={key} className="form-group">
                                <label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                <input value={editModal[key] || ''} onChange={e => setEditModal({...editModal, [key]: e.target.value})} />
                            </div>
                        ))
                    )}
                </div>
                <div className="pt-4 space-y-3">
                  <button type="submit" className="w-full py-5 bg-yellow-400 text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Save size={18}/> Commit Changes</button>
                  
                  {/* UPDATED: REMOVED REVOKE LICENSE, ADDED DELETE DRIVER */}
                  {editModal.type === 'driver' && (
                    <button type="button" onClick={() => handleDeleteDriver(editModal._id)} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <Trash2 size={16}/> Delete Driver Record
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATIONS (DEPT & USER) */}
        {deleteConfirm && <DeleteConfirmModal onCancel={() => setDeleteConfirm(null)} onConfirm={confirmDeleteDept} title="Delete Department?" />}
        {userDeleteConfirm && <DeleteConfirmModal onCancel={() => setUserDeleteConfirm(null)} onConfirm={confirmDeleteUser} title="Revoke User Access?" />}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .edit-btn { padding: 10px; background: #f8fafc; color: #94a3b8; border-radius: 12px; transition: 0.3s; border: 1px solid #f1f5f9; }
        .edit-btn:hover { background: #1e293b; color: white; border-color: #1e293b; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1.5px; margin-left: 4px; }
        .form-group input, .input-style { height: 52px; padding: 0 20px; background: #f8fafc; border: 2px solid transparent; border-radius: 16px; outline: none; font-weight: 700; color: #1e293b; transition: 0.3s; }
        .form-group input:focus { border-color: #eab308; background: white; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function TabBtn({ id, icon, label, active, set }) {
  const isActive = active === id;
  return (
    <button onClick={() => set(id)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shrink-0 ${isActive ? "bg-slate-900 text-yellow-400 shadow-lg" : "text-slate-400 hover:bg-slate-100"}`}>
      {icon} {label}
    </button>
  );
}

function DeleteConfirmModal({ title, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter leading-relaxed mb-8">This action is permanent and cannot be reversed.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-slate-200">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-red-600">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}