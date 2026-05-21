import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api';
import { Search, Trash2, ShieldCheck, Loader, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['VOLUNTEER', 'ORGANIZER', 'ADMIN'];

const roleColors = {
  ADMIN:     { bg: 'rgba(235,76,76,0.12)',  color: '#c62828' },
  ORGANIZER: { bg: 'rgba(243,198,35,0.15)', color: '#b8860b' },
  VOLUNTEER: { bg: 'rgba(195,214,234,0.4)', color: '#00203D' },
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => userApi.getAll({ search, role: roleFilter, limit: 50 }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => userApi.changeRole(id, role),
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
    onError: (err) => alert(err.response?.data?.message || 'Алдаа гарлаа'),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setConfirmDelete(null);
    },
    onError: (err) => alert(err.response?.data?.message || 'Алдаа гарлаа'),
  });

  const users = data?.data?.data || [];

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Хэрэглэгчид</h1>
          <p style={styles.subtitle}>Нийт {users.length} хэрэглэгч</p>
        </div>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchWrapper}>
          <Search size={14} color="#718096" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Нэр эсвэл и-мэйлээр хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={styles.select}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Бүх эрх</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {isLoading && (
        <div style={styles.loading}>
          <Loader size={18} color="#718096" />
          <span>Ачааллаж байна...</span>
        </div>
      )}

      {isError && (
        <div className="alert alert-error">Хэрэглэгчдийг ачааллахад алдаа гарлаа.</div>
      )}

      {!isLoading && users.length === 0 && (
        <div style={styles.empty}>
          <Inbox size={40} color="#C3D6EA" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#00203D' }}>Хэрэглэгч олдсонгүй</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Нэр</th>
                <th style={styles.th}>И-мэйл</th>
                <th style={styles.th}>Код</th>
                <th style={styles.th}>Эрх</th>
                <th style={styles.th}>Бүртгэгдсэн огноо</th>
                <th style={styles.th}>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rc = roleColors[u.role] || roleColors.VOLUNTEER;
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.id}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={{ ...styles.td, color: '#718096' }}>{u.identifier || '—'}</td>
                    <td style={styles.td}>
                      {isSelf ? (
                        <span style={{ ...styles.roleBadge, background: rc.bg, color: rc.color }}>
                          {u.role}
                        </span>
                      ) : (
                        <select
                          style={{ ...styles.roleSelect, background: rc.bg, color: rc.color }}
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                          disabled={roleMutation.isPending}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                    <td style={{ ...styles.td, color: '#718096' }}>
                      {new Date(u.created_at).toLocaleDateString('mn-MN')}
                    </td>
                    <td style={styles.td}>
                      {!isSelf && (
                        <button
                          style={styles.deleteBtn}
                          onClick={() => setConfirmDelete(u)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Хэрэглэгч устгах</h2>
            <hr />
            <p style={{ fontSize: 14, color: '#4A5568', margin: '16px 0' }}>
              <strong>{confirmDelete.name}</strong> ({confirmDelete.email}) хэрэглэгчийг
              устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцааж болохгүй.
            </p>
            <div className="flex gap-8 mt-16" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                Болих
              </button>
              <button
                style={styles.confirmDeleteBtn}
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Устгаж байна...' : 'Устгах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#00203D', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#718096' },
  filters: { display: 'flex', gap: 12, marginBottom: 20 },
  searchWrapper: { position: 'relative', flex: 1 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' },
  searchInput: { width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', boxSizing: 'border-box', outline: 'none' },
  select: { padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, color: '#00203D', background: '#fff', outline: 'none', cursor: 'pointer' },
  loading: { display: 'flex', alignItems: 'center', gap: 10, padding: 32, color: '#718096', fontSize: 14 },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8 },
  tableWrapper: { border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#00203D' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#C3D6EA', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #E0E0E0' },
  td: { padding: '12px 14px', fontSize: 13, color: '#00203D' },
  roleBadge: { display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.4px' },
  roleSelect: { fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.4px', outline: 'none' },
  deleteBtn: { display: 'inline-flex', alignItems: 'center', padding: '6px', background: 'rgba(235,76,76,0.1)', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer' },
  confirmDeleteBtn: { padding: '9px 20px', background: '#c62828', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
};

export default AdminUsersPage;