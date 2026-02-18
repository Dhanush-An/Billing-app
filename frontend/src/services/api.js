const API_BASE_URL = '/api';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API Error');
    }
    return response.json();
};

export const api = {
    // Products
    products: {
        getAll: () => fetch(`${API_BASE_URL}/products`, { headers: getAuthHeader() }).then(handleResponse),
        create: (data) => fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        update: (id, data) => fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        delete: (id) => fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(handleResponse)
    },

    // Sales
    sales: {
        getAll: () => fetch(`${API_BASE_URL}/sales`, { headers: getAuthHeader() }).then(handleResponse),
        create: (data) => fetch(`${API_BASE_URL}/sales`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse)
    },

    // Entities (Customers/Suppliers)
    entities: {
        getCustomers: () => fetch(`${API_BASE_URL}/entities/customers`, { headers: getAuthHeader() }).then(handleResponse),
        createCustomer: (data) => fetch(`${API_BASE_URL}/entities/customers`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        updateCustomer: (id, data) => fetch(`${API_BASE_URL}/entities/customers/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        deleteCustomer: (id) => fetch(`${API_BASE_URL}/entities/customers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(handleResponse),

        getSuppliers: () => fetch(`${API_BASE_URL}/entities/suppliers`, { headers: getAuthHeader() }).then(handleResponse),
        createSupplier: (data) => fetch(`${API_BASE_URL}/entities/suppliers`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        updateSupplier: (id, data) => fetch(`${API_BASE_URL}/entities/suppliers/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse),
        deleteSupplier: (id) => fetch(`${API_BASE_URL}/entities/suppliers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(handleResponse)
    }
};
