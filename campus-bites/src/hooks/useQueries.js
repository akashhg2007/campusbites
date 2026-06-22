import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import API_URL from '../apiConfig';

const fetchWithAuth = async (url, options = {}) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return res.json();
};

export const useProducts = (category) => {
    return useQuery({
        queryKey: ['products', category],
        queryFn: () => fetchWithAuth(`/api/products${category && category !== 'All' ? `?category=${category}` : ''}`),
        staleTime: 30000
    });
};

export const useMyOrders = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['orders', 'mine'],
        queryFn: () => fetchWithAuth('/api/orders/mine'),
        enabled: !!user,
        refetchInterval: 30000
    });
};

export const useStaffOrders = () => {
    return useQuery({
        queryKey: ['orders', 'staff'],
        queryFn: () => fetchWithAuth('/api/orders/staff/active'),
        refetchInterval: 10000
    });
};

export const useAnalytics = () => {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: () => fetchWithAuth('/api/analytics'),
        refetchInterval: 60000
    });
};

export const useRecommendations = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['recommendations'],
        queryFn: () => fetchWithAuth('/api/recommendations'),
        enabled: !!user,
        staleTime: 60000,
        retry: false
    });
};

export const useLoyalty = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['loyalty'],
        queryFn: () => fetchWithAuth('/api/loyalty/balance'),
        enabled: !!user,
        retry: false
    });
};

export const useUpdateOrderStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, status }) => fetchWithAuth(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['orders'] });
            qc.invalidateQueries({ queryKey: ['analytics'] });
        }
    });
};

export const useCreateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => fetchWithAuth('/api/products', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
    });
};

export const useUpdateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => fetchWithAuth(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
    });
};

export const useDeleteProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => fetchWithAuth(`/api/products/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
    });
};

export const useAddresses = () => {
    const user = useAuthStore(s => s.user);
    return useQuery({
        queryKey: ['addresses'],
        queryFn: () => fetchWithAuth('/api/addresses'),
        enabled: !!user,
        retry: false
    });
};

export const useFeedbackStats = () => {
    return useQuery({
        queryKey: ['feedback-stats'],
        queryFn: () => fetchWithAuth('/api/feedback/stats'),
        retry: false
    });
};

export const useAdminUsers = (params = '') => {
    return useQuery({
        queryKey: ['admin-users', params],
        queryFn: () => fetchWithAuth(`/api/admin/users?${params}`),
        retry: false
    });
};
