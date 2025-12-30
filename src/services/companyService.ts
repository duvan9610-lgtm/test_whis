import apiClient from '../api/client';
import { Company, UserRole } from '../types';
import { userService } from './userService';

export interface CreateCompanyPayload {
    name: string;
    adminUser: {
        name: string;
        email: string;
        password: string;
    };
}

export const companyService = {
    // List all companies
    listCompanies: async (): Promise<Company[]> => {
        try {
            const response = await apiClient.get<Company[]>('/companies');
            console.log('GET /companies response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching companies:', error.response?.status, error.response?.data);
            throw error;
        }
    },

    // Create a new company with admin user (two separate calls)
    // NOTE: The /companies endpoint might not exist in the API documentation
    // This assumes it exists. If not, companies need to be created via backend admin panel
    createCompany: async (payload: CreateCompanyPayload): Promise<Company> => {
        console.log('Step 1: Creating company with name:', payload.name);

        // Step 1: Create the company
        let newCompany: Company;
        try {
            const companyResponse = await apiClient.post<Company>('/companies', {
                name: payload.name
            });
            newCompany = companyResponse.data;
            console.log('Company created successfully:', newCompany);
        } catch (error: any) {
            console.error('Error creating company:', error.response?.status, error.response?.data);
            throw new Error(`Error al crear empresa: ${error.response?.data?.message || error.message}`);
        }

        // Step 2: Create the admin user for this company
        console.log('Step 2: Creating admin user for company ID:', newCompany.id);
        try {
            const userPayload = {
                name: payload.adminUser.name,
                email: payload.adminUser.email,
                password: payload.adminUser.password,
                role: 'admin' as UserRole, // Use lowercase to match backend format
                companyId: newCompany.id // Assign user to the newly created company
            };
            console.log('Creating user with payload:', userPayload);

            const createdUser = await userService.createUser(userPayload);
            console.log('Admin user created successfully:', createdUser);
        } catch (userError: any) {
            console.error('Error creating admin user:', userError.response?.status, userError.response?.data);
            // Company was created but user failed
            throw new Error(`Empresa creada pero falló la creación del usuario: ${userError.response?.data?.message || userError.message}`);
        }

        return newCompany;
    },

    // Update an existing company
    updateCompany: async (id: number, name: string): Promise<Company> => {
        try {
            const response = await apiClient.put<Company>(`/companies/${id}`, { name });
            console.log('Company updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error updating company:', error.response?.status, error.response?.data);
            throw new Error(`Error al actualizar empresa: ${error.response?.data?.message || error.message}`);
        }
    },

    // Delete a company
    deleteCompany: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/companies/${id}`);
            console.log('Company deleted successfully');
        } catch (error: any) {
            console.error('Error deleting company:', error.response?.status, error.response?.data);
            throw new Error(`Error al eliminar empresa: ${error.response?.data?.message || error.message}`);
        }
    }
};
